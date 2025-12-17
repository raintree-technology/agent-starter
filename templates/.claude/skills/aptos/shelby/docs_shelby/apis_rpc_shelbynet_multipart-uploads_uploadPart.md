---
url: https://docs.shelby.xyz/apis/rpc/shelbynet/multipart-uploads/uploadPart
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

# Upload a part

Upload a part for a multipart upload session.

loading...

PUT

``/`v1`/`multipart-uploads`/`{uploadId}`/`parts`/`{partIdx}`

Send

Path

Body

## Path Parameters

uploadIdstring

The ID of the multipart upload session.

partIdxinteger

The index of the part to upload (0-based).

## Request Body

bodyunknown

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
    
    
    curl -X PUT "https://api.shelbynet.shelby.xyz/shelby/v1/multipart-uploads/string/parts/0"

200400
    
    
    {
      "success": true
    }

Empty

[Begin a multipart upload POSTPrevious Page](/apis/rpc/shelbynet/multipart-uploads/startMultipartUpload)[Complete a multipart upload POSTNext Page](/apis/rpc/shelbynet/multipart-uploads/completeMultipartUpload)