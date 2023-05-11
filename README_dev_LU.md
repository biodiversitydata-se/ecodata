to launch ecodata on canmove-dev :

1- make sure java11 is used 
java -version 
=> must be 11

if not :

sudo nano /etc/profile

uncheck 11

sudo update-alternatives --install "/usr/bin/java" "java" "/usr/lib/jvm/java-11-openjdk-amd64/bin/java" 1
sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/lib/jvm/java-11-openjdk-amd64/bin/javac" 1

sudo update-alternatives --config java
select /usr/lib/jvm/java-11-openjdk-amd64/bin/java (la 1 normalement sur canmove-dev)
same with :
sudo update-alternatives --config javac
select /usr/lib/jvm/java-11-openjdk-amd64/bin/javac (la 1 normalement)


2- use the right version of grails (to be checked in gradle.properties)
sdk use grails 5.2.5

3- launch elastic search
cd elasticsearch/elasticsearch-7.15.2
./bin/elasticsearch


4- OPTIONAL : launch geoserver
cd geoserver-2.7.4
./bin/startup.sh (not tested for a long time, to be checked)

5- launch ecodata
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

