---
url: https://docs.shelby.xyz/apis/rpc/shelbynet/storage/getBlob
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

# Retrieve a blob

Retrieve a blob or a byte range of a blob.

loading...

GET

``/`v1`/`blobs`/`{account}`/`{blobName}`

Send

Path

Header

## Path Parameters

accountstring

The account the blob belongs to.

blobNamestring

The name of the blob to retrieve. This CAN include `/` characters.

## Header Parameters

range?string

The byte range to retrieve, in the format `bytes=start-end`. If not specified, the entire blob will be returned.

## Response Body

### 200

application/octet-stream

### 206

application/octet-stream

### 400

### 404

### 416

cURL

JavaScript

Go

Python

Java

C#
    
    
    curl -X GET "https://api.shelbynet.shelby.xyz/shelby/v1/blobs/string/path/to/myblob.txt" \  -H "range: bytes=0-1023"

200206400404416

Empty

Empty

Empty

Empty

Empty

[Create a micropayment channel POSTPrevious Page](/apis/rpc/shelbynet/sessions/createMicropaymentChannel)[Upload a blob PUTNext Page](/apis/rpc/shelbynet/storage/uploadBlob)