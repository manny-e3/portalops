<?php
// PortalOps BYOS Server Setup Bridge
// Forwards 1-line script requests and completion callbacks from portalops.online to apis.portalops.online
$file = $_GET['file'] ?? '';
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$path = preg_replace('/^\/setup\/?/', '', parse_url($requestUri, PHP_URL_PATH) ?? '');
if (empty($path)) {
    $path = $file;
}

$targetUrl = 'https://apis.portalops.online/setup/' . $path;

$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

$headers = [];
if (function_exists('getallheaders')) {
    foreach (getallheaders() as $name => $value) {
        if (strtolower($name) !== 'host') {
            $headers[] = "$name: $value";
        }
    }
}
$headers[] = 'Host: apis.portalops.online';
$headers[] = 'X-Forwarded-Host: portalops.online';

if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo "#!/bin/bash\necho \"PortalOps Error: Setup service temporarily unreachable.\" >&2\nexit 1\n";
    exit;
}

http_response_code($code ?: 200);
header('Content-Type: ' . ($contentType ?: 'text/plain; charset=utf-8'));
echo $response;

