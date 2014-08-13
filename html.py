#!/usr/bin/env python
# -*- coding: utf-8 -*-

def encode_html(t):
	entites = {
		"&amp;" : "eperluetteamp",
		"&#33;" : "!",
		"&quot;" : '"',
		"&#36;" : "$",
		"&#39;" : "'",
		"&#40;" : "(",
		"&#41;" : ")",
		"&#42;" : "*",
		"&#43;" : "+",
		"&#44;" : ",",
		"&#45;" : "-",
		"&#46;" : ".",
		"&#47;" : "/",
		"&#58;" : ":",
		"&lt;" : "<",
		"&#61;" : "=",
		"&gt;" : ">",
		"&#63;" : "?",
		"&#64;" : "@",
		"&#91;" : "[",
		"&#92;" : "\\",
		"&#93;" : "]",
		"&#94;" : "^",
		"&#95;" : "_",
		"&#96;" : "`",
		"&#123;" : "{",
		"&#124;" : "|",
		"&#125;" : "}",
		"&#126;" : "~",
		"&euro;" : "€",
		"&#129;" : "",
		"&sbquo;" : "‚",
		"&fnof;" : "ƒ",
		"&bdquo;" : "„",
		"&hellip;" : "…",
		"&dagger;" : "†",
		"&Dagger;" : "‡",
		"&circ;" : "ˆ",
		"&permil;" : "‰",
		"&Scaron;" : "Š",
		"&lsaquo;" : "‹",
		"&OElig;" : "Œ",
		"&#141;" : "",
		"&#381;" : "Ž",
		"&#143;" : "",
		"&#144;" : "",
		"&lsquo;" : "‘",
		"&rsquo;" : "’",
		"&ldquo;" : "“",
		"&rdquo;" : "”",
		"&bull;" : "•",
		"&ndash;" : "-",
		"&mdash;" : "—",
		"&trade;" : "™",
		"&oelig;" : "œ",
		"&#157;" : "",
		"&#382;" : "ž",
		"&Yuml;" : "Ÿ",
		"espace" : "0160",
		"&iexcl;" : "¡",
		"&cent;" : "¢",
		"&pound;" : "£",
		"&curren;" : "¤",
		"&yen;" : "¥",
		"&brvbar;" : "¦",
		"&sect;" : "§",
		"&uml;" : "¨",
		"&copy;" : "©",
		"&ordf;" : "ª",
		"&laquo;" : "«",
		"&not;" : "¬",
		"césure" : "0173",
		"&reg;" : "®",
		"&macr;" : "¯",
		"&deg;" : "°",
		"&plusmn;" : "±",
		"&sup2;" : "²",
		"&sup3;" : "³",
		"&acute;" : "´",
		"&micro;" : "µ",
		"&para;" : "¶",
		"&middot;" : "·",
		"&cedil;" : "¸",
		"&sup1;" : "¹",
		"&ordm;" : "º",
		"&raquo;" : "»",
		"&frac14;" : "¼",
		"&frac12;" : "½",
		"&frac34;" : "¾",
		#~ "&iquest;" : "¿",
		"&#63;" : "¿",
		"&Agrave;" : "À",
		"&Aacute;" : "Á",
		"&Acirc;" : "Â",
		"&Atilde;" : "Ã",
		"&Auml;" : "Ä",
		"&Aring;" : "Å",
		"&AElig;" : "Æ",
		"&Ccedil;" : "Ç",
		"&Egrave;" : "È",
		"&Eacute;" : "É",
		"&Ecirc;" : "Ê",
		"&Euml;" : "Ë",
		"&Igrave;" : "Ì",
		"&Iacute;" : "Í",
		"&Icirc;" : "Î",
		"&Iuml;" : "Ï",
		"&Ograve;" : "Ò",
		"&Oacute;" : "Ó",
		"&Ocirc;" : "Ô",
		"&Otilde;" : "Õ",
		"&Ouml;" : "Ö",
		"&times;" : "×",
		"&Oslash;" : "Ø",
		"&Ugrave;" : "Ù",
		"&Uacute;" : "Ú",
		"&Ucirc;" : "Û",
		"&Uuml;" : "Ü",
		"&Yacute;" : "Ý",
		"&THORN;" : "Þ",
		"&szlig;" : "ß",
		"&agrave;" : "à",
		"&aacute;" : "á",
		"&acirc;" : "â",
		"&atilde;" : "ã",
		"&auml;" : "ä",
		"&aring;" : "å",
		"&aelig;" : "æ",
		"&ccedil;" : "ç",
		"&egrave;" : "è",
		"&eacute;" : "é",
		"&ecirc;" : "ê",
		"&euml;" : "ë",
		"&igrave;" : "ì",
		"&iacute;" : "í",
		"&icirc;" : "î",
		"&iuml;" : "ï",
		"&eth;" : "ð",
		"&ntilde;" : "ñ",
		"&ograve;" : "ò",
		"&oacute;" : "ó",
		"&ocirc;" : "ô",
		"&otilde;" : "õ",
		"&ouml;" : "ö",
		"&oslash;" : "ø",
		"&ugrave;" : "ù",
		"&uacute;" : "ú",
		"&ucirc;" : "û",
		"&uuml;" : "ü",
		"&yacute;" : "ý",
		"&thorn;" : "þ"
	}
	for i in entites:
		t = t.replace(entites[i], i)
	return t
