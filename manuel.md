<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Manuel</title>
</head>
<body>
# Manuel

Ce site fournit simplement un échiquier pour jouer à distance et être informé par mail lorsque votre adversaire a joué. Vous devez donc fournir une adresse mail valide lors de votre inscription, aucune pub ou spam ne sera envoyé dessus et elle ne sera communiqué à aucun tier, pas même à vos adversaire.

Attention, ce site n'est pas prévu pour fonctionner avec Internet Explorer, utilisez un vrai navigateur à la place.


## Asynchrone jusqu'au plateau

![envoyer](./img/send.png 'envoyer') Envoyer le nouveau coup.

![recharger](./img/refresh.png 'recharger') Télécharger la liste des coups depuis le serveur.

Tous les coups que vous jouez sur le plateau ne sont pas envoyés directement. Cela vous permet de tester vos stratégies sur plusieurs coups, et aussi d'éviter d'envoyer une erreur ! (un mauvais clique est vite arrivé). Une fois que vous êtes sûr de votre coup vous pouvez cliquer sur le bouton « envoyer ».

Le coup qui sera envoyé est indiqué, si vous constatez une erreur vous pouvez encore annuler en cliquant sur :
![revenir à la position initiale](./img/init.png 'revenir à la position initiale')


## Naviguer dans l'historique

Vous pouvez naviguer dans l'historique en cliquant directement sur le coup, puis en utilisant les flèches haut et bas du clavier.

![revenir à la position initiale](./img/init.png 'revenir à la position initiale') Revenir à la position initiale (permet d'annuler tous les coups que vous avez fait depuis le dernier chargement et qui ne sont pas encore envoyés).

Avec le bouton « revenir à la position initiale » si votre adversaire a joué entre temps vous n'en serez pas informez, pour cela il faut cliquer sur recharger (flèche vers le bas).


## Les autres boutons
 
 - Pour ajouter un commentaire, cliquez sur le numéro du coup.

    * Les commentaires sont privés tout durant que la partie n'est pas terminée.
    * Tous les commentaires deviennent publics dès que la partie est terminée.
    * N'importe quel joueur peut mettre un commentaire (même s'il ne joue pas dans la partie).

 - Quelle est la différence avec un message ?
  
	* Tous les messages sont publics, même si la partie n'est pas encore terminée.
	* Seul les participants d'une partie peuvent s'envoyer des messages.
	* Le message se place au niveau du dernier coup en cours (contrairement au commentaire où on choisit le coup).
 
 - La touche ECHAP permet de passer en mode « patron » : affiche l'échiquier en ASCII pour être plus discret au travail. Ce mode ne permet pas de sélectionner une pièce, il faut repasser en mode normal en appuyant de nouveau sur ECHAP pour jouer.
 
 - Pour afficher le PGN, cliquez sur le numéro de la partie juste en dessous des boutons (avec le nom des joueurs).

 - ![](./img/rotate.png 'annuler') Retourner l'échiquier.

 - ![](./img/help.png 'annuler') Afficher l'aide.

## Informations complémentaires

Toutes les parties sont publiques, cela implique que tous vos messages pourront être lus (faites attention à ce qui vous écrivez). Pour partager une partie avec un spectateur il suffit de lui donner le lien que vous recevez dans le mail (il se termine par "?gid=" suivi du numéro de la partie).

[Retour](./)
</body>
</html>
