#!/usr/bin/env python
# -*- coding: utf-8 -*-

import bdd

b = bdd.bdd()

fd = open('news_count.txt', 'w')
fd.write(str(b.max_news()))
fd.close()
