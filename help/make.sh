#!/bin/bash
cat header.html > manuel.html
markdown manuel.md >> manuel.html
cat footer.html >> manuel.html
