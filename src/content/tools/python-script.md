---
name: "Python Script (Custom)"
description: "A custom Python script that orchestrates the A/B test by randomizing clips and modes, controlling Jriver and the AVR, and logging ratings."
category: "Automation"
isGPT: false
pricing: "Free (open-source)"
affiliateUrl: "https://www.python.org/"
tags: ["Automation","Scripting","Python"]
---

This custom script ties everything together. It uses the `requests` library to talk to Jriver and raw sockets to send commands to the AVR. The script is provided in the workflow and can be easily modified to support different AVR brands or additional modes.
