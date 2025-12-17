---
url: https://docs.shelby.xyz/apis/rpc/localhost/multipart-uploads/startMultipartUpload
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

# Begin a multipart upload

Begin a multipart upload session.

loading...

POST

``/`v1`/`multipart-uploads`

Send

Body

## Request Body

rawAccount?string

The account to upload the blob to.

rawBlobName?string

The name of the blob to upload.

rawPartSize?integer

The size of each part in bytes.

Default`1048576`

## Response Body

### 200

application/json

### 400

cURL

JavaScript

Go

Python

Java

C#
    
    
    curl -X POST "http://localhost:9090/v1/multipart-uploads" \  -H "Content-Type: application/json" \  -d '{}'

200400
    
    
    {
      "uploadId": "string"
    }

Empty

[Upload a blob PUTPrevious Page](/apis/rpc/localhost/storage/uploadBlob)[Upload a part PUTNext Page](/apis/rpc/localhost/multipart-uploads/uploadPart)