to launch ecodata on canmove-dev :


1- launch elastic search
cd elasticsearch/elasticsearch-7.15.1
./bin/elasticsearch


2- OPTIONAL : launch geoserver
cd geoserver-2.7.4
./bin/startup.sh (not tested for a long time, to be checked)

3- launch ecodata
grails run-app


make sure the port 8080 is open on the firewall
sudo ufw status verbose
there should be :
8080/tcp (v6)              ALLOW IN    Anywhere (v6)             
if not, run :
sudo ufw allow 8080/tcp

to create a new package :
from ecodata-dev
grails package

