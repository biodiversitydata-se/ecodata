to launch ecodata on canmove-dev :

1- check that java version is 8

java -version

if not : 

*** change java version ****

sudo nano /etc/profile
=> enable the correct jdk 8 by uncommenting the lines

sudo update-alternatives --install "/usr/bin/java" "java" "/usr/lib/jvm/java-8-openjdk-amd64/bin/java" 1
sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/lib/jvm/java-8-openjdk-amd64/bin/javac" 1


sudo update-alternatives --config java
=> select /usr/lib/jvm/java-8-openjdk-amd64/bin/java (la 4 normalement)
sudo update-alternatives --config javac
=> select /usr/lib/jvm/java-8-openjdk-amd64/bin/javac (la 4 normalement)

source /etc/profile

2- use the correct version of grails as described in gradle.properties
sdk use grals 4.0.11

3- launch elastic search
cd elasticsearch/elasticsearch-7.15.1
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

