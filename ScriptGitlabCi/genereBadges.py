# coding=utf-8
import subprocess
import sys

color="green" #le badge est par défaut vert
message = ""

NBDIAGRAMS=subprocess.run("ls documentation/client/ | egrep \"*drawio\" | wc -l", shell=True, check=True, text=True, capture_output=True)
NBDIAGRAMSGENERE=subprocess.run("ls documentation/client/out | wc -l", shell=True, check=True, text=True, capture_output=True)

#On regarde s'il y a une difference
if NBDIAGRAMS.stdout != NBDIAGRAMSGENERE.stdout:
    color = "red"
    message = "Erreurs diagrammes"
else:
    message = "Diagrammes OK"

#on appelle anybadge pour faire un badge .svg
subprocess.run(f"""anybadge -o -l \"Drawio\" -v \"{message}\" -c \"{color}\" -f \"drawio.svg\"""", shell=True, check=True)


 
