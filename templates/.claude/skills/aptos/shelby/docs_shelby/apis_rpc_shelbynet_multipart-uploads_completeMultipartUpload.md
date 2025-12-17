---
url: https://docs.shelby.xyz/apis/rpc/shelbynet/multipart-uploads/completeMultipartUpload
fetched: 2025-11-16
---

[](/)

Search

`⌘``K`

APIs

Specifications and references

[Shelby RPC API](/apis/rpc)

[Shelbynet](/apis/rpc/shelbynet)

Sessions

[Use a session POST](/apis/rpc/shelbynet/sessions/useSession)[Create a session POST](/apis/rpc/shelbynet/sessions/createSession)[Create a micropayment channel POST](/apis/rpc/shelbynet/sessions/createMicropaymentChannel)

Storage

[Retrieve a blob GET](/apis/rpc/shelbynet/storage/getBlob)[Upload a blob PUT](/apis/rpc/shelbynet/storage/uploadBlob)

Multipart Uploads

[Begin a multipart upload POST](/apis/rpc/shelbynet/multipart-uploads/startMultipartUpload)[Upload a part PUT](/apis/rpc/shelbynet/multipart-uploads/uploadPart)[Complete a multipart upload POST](/apis/rpc/shelbynet/multipart-uploads/completeMultipartUpload)

[Localhost](/apis/rpc/localhost)

Faucet

[](https://github.com/shelby)

[Shelby RPC API](/apis/rpc)[Shelbynet](/apis/rpc/shelbynet)

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
    
    
    curl -X POST "https://api.shelbynet.shelby.xyz/shelby/v1/multipart-uploads/string/complete"

200
    
    
    {
      "success": true
    }

[Upload a part PUTPrevious Page](/apis/rpc/shelbynet/multipart-uploads/uploadPart)[Localhost APIAPI endpoints for Local Development](/apis/rpc/localhost)