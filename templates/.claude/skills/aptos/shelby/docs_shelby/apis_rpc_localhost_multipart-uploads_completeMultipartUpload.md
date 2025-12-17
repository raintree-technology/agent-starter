---
url: https://docs.shelby.xyz/apis/rpc/localhost/multipart-uploads/completeMultipartUpload
fetched: 2025-11-16
---

[](/)

Search

`⌘``K`

APIs

Specifications and references

[Shelby RPC API](/apis/rpc)

[Shelbynet](/apis/rpc/shelbynet)

[Localhost](/apis/rpc/localhost)

Sessions

[Use a session POST](/apis/rpc/localhost/sessions/useSession)[Create a session POST](/apis/rpc/localhost/sessions/createSession)[Create a micropayment channel POST](/apis/rpc/localhost/sessions/createMicropaymentChannel)

Storage

[Retrieve a blob GET](/apis/rpc/localhost/storage/getBlob)[Upload a blob PUT](/apis/rpc/localhost/storage/uploadBlob)

Multipart Uploads

[Begin a multipart upload POST](/apis/rpc/localhost/multipart-uploads/startMultipartUpload)[Upload a part PUT](/apis/rpc/localhost/multipart-uploads/uploadPart)[Complete a multipart upload POST](/apis/rpc/localhost/multipart-uploads/completeMultipartUpload)

Faucet

[](https://github.com/shelby)

[Shelby RPC API](/apis/rpc)[Localhost](/apis/rpc/localhost)

# Complete a multipart upload

Complete a multipart upload session.

loading...

POST

``/`v1`/`multipart-uploads`/`{uploadId}`/`complete`

Send

Path

## Path Parameters

uploadIdstring

The ID of the multipart upload session.

## Response Body

### 200

application/json

cURL

JavaScript

Go

Python

Java

C#
    
    
    curl -X POST "http://localhost:9090/v1/multipart-uploads/string/complete"

200
    
    
    {
      "success": true
    }

[Upload a part PUTPrevious Page](/apis/rpc/localhost/multipart-uploads/uploadPart)[ShelbyUSD TokensFaucet for ShelbyUSD](/apis/faucet/shelbyusd)