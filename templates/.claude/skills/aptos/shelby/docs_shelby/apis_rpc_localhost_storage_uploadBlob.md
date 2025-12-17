---
url: https://docs.shelby.xyz/apis/rpc/localhost/storage/uploadBlob
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

# Upload a blob

Upload a blob.

loading...

PUT

``/`v1`/`blobs`/`{account}`/`{blobName}`

Send

Path

Header

Body

## Path Parameters

accountstring

The account the blob belongs to.

blobNamestring

The name of the blob to retrieve. This CAN include `/` characters.

## Header Parameters

Content-Lengthinteger

The size of the blob in bytes.

## Request Body

bodyunknown

## Response Body

### 204

### 400

cURL

JavaScript

Go

Python

Java

C#
    
    
    curl -X PUT "http://localhost:9090/v1/blobs/string/path/to/myblob.txt" \  -H "Content-Length: 0"

204400

Empty

Empty

[Retrieve a blob GETPrevious Page](/apis/rpc/localhost/storage/getBlob)[Begin a multipart upload POSTNext Page](/apis/rpc/localhost/multipart-uploads/startMultipartUpload)