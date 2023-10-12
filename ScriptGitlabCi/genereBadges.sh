#!/bin/bash
#Pour le badge lié aux exercices 
#Doit etre lancé à la racine du projet


NBERR=0 #on compte le nombre d'erreurs
NBWARN=0 #et de warnings
color="green" #le badge est par défaut vert

NBDIAGRAMS=$(ls documentation/client/ | egrep "*drawio" | wc -l)
NBDIAGRAMSGENERE=$(ls documentation/client/out | wc -l)


if [[ $NBERR > 0 ]] #si on a plus d'une erreur, le badge passe au rouge
then 
  color="red"
  else if [[ $NBWARN > 0 ]] #si on a pas d'erreurs mais qu'on a des warnings, le badge passe au orange
  then 
    color="orange"
  fi
fi
anybadge -o -l "Drawio" -v "$NBERR erreur $NBWARN warning" -c "$color" -f "drawio.svg" #on appelle anybadge pour faire un badge .svg
