---
url: https://docs.shelby.xyz/tools/cli/commands/uploads-and-downloads
fetched: 2025-11-16
---

[](/)

Search

`⌘``K`

Tools

Developer tooling

CLI

Introduction

[Getting Started](/tools/cli)[CLI Management](/tools/cli/management)

Commands

[Account Management](/tools/cli/commands/account-management)[Context Management](/tools/cli/commands/context-management)[Uploads and Downloads](/tools/cli/commands/uploads-and-downloads)[Faucet](/tools/cli/commands/faucet)[Commitment](/tools/cli/commands/commitment)

[Shelby Explorer](/tools/explorer)

Wallet Setup

[AI & LLM Integration](/tools/ai-llms)

[](https://github.com/shelby)

CLI

# Uploads and Downloads

Upload and download files using the Shelby CLI

# Overview

The Shelby CLI provides a number of simple operations for uploading and downloading files.

It is important that the CLI is properly configured with a network and funded account. If not, please visit the [Getting Started](/tools/cli) quick start guide for more information.

## `shelby upload`

Uploads a blob or local directory of blobs to Shelby, using the currently active account as the account to upload to. This will charge SHEL tokens.
    
    
    shelby upload [options] <src> <dst>

### Options

Flag| Alias| Type| Required| Default| Description  
---|---|---|---|---|---  
`--expiration <datetime>`| `-e`| string| yes| -| Expiration timestamp.  
`--recursive`| `-r`| flag| | false| Upload every file under a directory.  
`--assume-yes`| | flag| | false| Skip interactive cost confirmation. Useful for scripts.  
`--output-commitments <file>`| | string| | -| Persist the generated commitments alongside the upload for later inspection.  
  
If uploading a single blob, `<dst>` must always be a valid blob name (does not end in `/`, and no more than 1024 characters).

When uploading a directory recursively, `<dst>` must end in `/`.

The `--expiration` option accepts:

  * Human language timestamp:
    * `in 2 days`
    * `next Friday`
    * `next month`
    * `2025-12-31`
  * UNIX timestamp: `1735689600` (seconds since epoch)
  * ISO date string: `"2025-01-01T00:00:00Z"`
  * Human-readable date: `"2025-01-01"` or `"Jan 1, 2025"`



The uploaded file list is created before starting the operation. File sizes are saved as the file list is created. If any files change size between the initial listing and the upload, the upload will fail when it reaches the modified files.

#### Basic Example
    
    
    shelby upload local-video.mp4 shelby-output.mp4 -e <UNIX-EPOCH>

#### Relative Paths
    
    
    shelby upload ./local-video.mp4 shelby/blob/name.mp4 -e <UNIX-EPOCH>

#### Other Date Formats
    
    
    shelby upload local-video.mp4 best-videos/video.mp4 --expiration <UNIX-EPOCH>
    shelby upload local-video.mp4 best-videos/video.mp4 -e "2025-12-31"
    shelby upload local-video.mp4 best-videos/video.mp4 -e "2025-12-31T00:00:00Z"
    shelby upload local-video.mp4 best-videos/video.mp4 -e "2025-12-31T00:00:00-0500"

On UNIXes, the `date` command can help too:
    
    
    shelby upload video.mp4 best-videos/video.mp4 -e $(date -d "+1 hour" +%s)

#### Directory Upload Example
    
    
    shelby upload -r ./hls_video/ best-videos/hls_video/ --expiration <UNIX-EPOCH>
    shelby upload --recursive ./website/ my-site/ -e "2025-12-31"

#### Canonical Directory Layout

The upload command will use the canonical filesystem layout when uploading directories recursively.

That is, if the source is laid out as:
    
    
    $ tree .
    .
    |-- bar
    `-- foo
        |-- baz
        `-- buzz
    
    2 directories, 3 files

The blobs uploaded to Shelby will have these blob names:
    
    
    <account>/<blob-prefix>/bar
    <account>/<blob-prefix>/foo/baz
    <account>/<blob-prefix>/foo/buzz

Note that there is no `<account>/<blob-prefix>/foo` blob in shelby as there is no concept of directory in blob storage. It is possible to later upload `<account>/<blob-prefix>/foo` as a separate blob; this would make it difficult to download the directory tree as a directory tree!

## `shelby download`

Currently you cannot download blobs that were uploaded by other accounts with the CLI. This will be fixed in the near future.

Download a file (or files) from the Shelby network, with progress reporting, for the active account.
    
    
    shelby download [options] <src> <dst>

### Options

Flag| Alias| Type| Required| Description  
---|---|---|---|---  
`--recursive`| `-r`| flag| | Treat `src` as a directory prefix. Both the `src` and `dst` must end with `/`.  
`--force`| `-f`| flag| | Overwrite existing files or clear a non-empty directory before downloading.  
  
The downloader validates filesystem state before fetching data. Create the parent directory ahead of time and supply `--force` if you need to overwrite existing content.

If downloading a single blob, `<src>` must be a valid blob name (does not end in /). The `<dst>` must not end in a directory separator and will be created as a file.

When downloading a directory recursively, both `<src>` and `<dst`> must end in /. The `<dst`> directory will be created if it doesn't exist.

Validation Rules:

  * The parent directory of `<dst>` must already exist
  * Without --force, the `dst` file must not exist, or must be an empty directory for recursive downloads
  * With --force, any existing `dst` will be completely removed before download



#### Basic example
    
    
    shelby download shelby/blob/name.mp4 ./video.mp4

#### Force Overwrite
    
    
    shelby download shelby/blob/name.mp4 ./existing-video.mp4 --force

#### Directory Download
    
    
    shelby download -r shelby/blobs/best-videos/hls_video/ ./hls_video/
    shelby download --recursive my-site/ ./website/

For recursive downloads, both `src` (the blob prefix) and `dst` (the target directory) must end with `/`.

#### Canonical Directory Layout

When downloading directories, the command recreates the directory structure locally.

If Shelby contains these blobs:
    
    
    my-files/document.pdf
    my-files/images/photo1.jpg
    my-files/images/photo2.jpg

Running:
    
    
    shelby download -r my-files/ ./local-files/

Will create:
    
    
    $ tree ./local-files/
    ./local-files/
    ├── document.pdf
    └── images/
        ├── photo1.jpg
        └── photo2.jpg

The download command automatically creates any necessary subdirectories and downloads all files.

#### Other Account's Files

For now, the CLI only interacts with active account in the CLI's context.

Files from other accounts are downloadable using the REST interface from the RPC node, which currently does not require any additional headers or session information for payment.

In general:
    
    
    curl https://api.shelbynet.shelby.xyz/shelby/v1/blobs/<account>/<blob-name>

For example, if I want to download the blob `foo` stored by account `0x89ca7dfadf5788830b0d5826a56b370ced0d7938c4628f4b57f346ab54f76357` I can use:
    
    
    curl https://api.shelbynet.shelby.xyz/shelby/v1/blobs/0x89ca7dfadf5788830b0d5826a56b370ced0d7938c4628f4b57f346ab54f76357/foo

[Context ManagementManaging contexts for the Shelby CLI](/tools/cli/commands/context-management)[Faucetshelby faucet CLI command](/tools/cli/commands/faucet)

### On this page

Overview`shelby upload`OptionsBasic ExampleRelative PathsOther Date FormatsDirectory Upload ExampleCanonical Directory Layout`shelby download`OptionsBasic exampleForce OverwriteDirectory DownloadCanonical Directory LayoutOther Account's Files