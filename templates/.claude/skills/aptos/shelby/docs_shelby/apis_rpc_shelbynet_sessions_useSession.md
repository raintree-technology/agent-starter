---
url: https://docs.shelby.xyz/apis/rpc/shelbynet/sessions/useSession
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

# Use a session

Use a session, decrementing the number of chunksets left.

loading...

POST

``/`v1`/`sessions`/`{sessionId}`/`use`

Send

Path

## Path Parameters

sessionIdstring

The ID of the session to use.

## Response Body

### 200

### 402

### 404

cURL

JavaScript

Go

Python

Java

C#
    
    
    curl -X POST "https://api.shelbynet.shelby.xyz/shelby/v1/sessions/string/use"

200402404

Empty

Empty

Empty

[Shelbynet APIAPI endpoints for Shelbynet](/apis/rpc/shelbynet)[Create a session POSTNext Page](/apis/rpc/shelbynet/sessions/createSession)