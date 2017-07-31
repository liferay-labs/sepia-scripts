#!/usr/bin/env bash

expression=$1

expect << EOF
spawn telnet localhost 11311
expect -re ".*>"
send "lb ${expression}\r"
expect -re ".*>"
send "exit\r"
EOF