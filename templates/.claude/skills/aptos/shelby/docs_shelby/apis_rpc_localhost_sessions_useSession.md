---
url: https://docs.shelby.xyz/apis/rpc/localhost/sessions/useSession
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
    
    
    curl -X POST "http://localhost:9090/v1/sessions/string/use"

200402404

Empty

Empty

Empty

[Localhost APIAPI endpoints for Local Development](/apis/rpc/localhost)[Create a session POSTNext Page](/apis/rpc/localhost/sessions/createSession)