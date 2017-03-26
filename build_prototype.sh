#!/bin/sh

grep prototype anticrux.js | grep -v throw | gsar -F -s".prototype" -r"" | gsar -F -s" = function" -r"" | gsar -F -s" {" -r"" | gsar -F -s"AntiCrux." -r"- AntiCrux."
