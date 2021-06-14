PaNOSC Cloud Provider CLI Client
================================

A PaNOSC Cloud Provider CLI client to test the Cloud Provider APIs


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->

Note: The <i>cloud-provider</i> command is equialent to ./bin/run

```sh-session
$ npm install
$ cloud-provider COMMAND
running command...
$ cloud-provider (-v|--version|version)
cloud-provider-cli-client/1.0.0 darwin-x64 node-v10.15.3
$ cloud-provider --help [COMMAND]
USAGE
  $ cloud-provider COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cloud-provider instance:COMMAND`](#cloud-provider-instance-command)
* [`cloud-provider image:COMMAND`](#cloud-provider-image-command)
* [`cloud-provider flavour:COMMAND`](#cloud-provider-flavour-command)
* [`cloud-provider help COMMAND]`](#cloud-provider-help-command)

## `cloud-provider instance:COMMAND`

perform instance related operations

```
USAGE
  $ cloud-provider instance:COMMAND

COMMANDS
  instance:add   Adds an instance to the cloud provider
  instance:list  List instances of the cloud provider
```

## `cloud-provider image:COMMAND`

perform image related operations

```
USAGE
  $ cloud-provider image:COMMAND

COMMANDS
  image:list  List images of the cloud provider
```

## `cloud-provider flavour:COMMAND`

perform flavour related operations

```
USAGE
  $ cloud-provider flavour:COMMAND

COMMANDS
  flavour:list  List flavours of the cloud provider
```

## `cloud-provider help [COMMAND]`

display help for cloud-provider

```
USAGE
  $ cloud-provider help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

<!-- commandsstop -->
