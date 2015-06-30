# construction du fichier HTML
git log --no-merges --pretty='<div class="com_auteur">%aD</div><div class="ta_left"><p>%B</p></div>' -n 20 | sed -e 'a <br/>' > news.html

# modification de la variable BREAKING_NEWS
# il suffit d'incrémenter la variable pour que les utilisateurs voit '(*)' sur le bouton 'news'.
vi news.js
