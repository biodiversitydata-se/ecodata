### Create the repo
```
git clone https://github.com/biodiversitydata-se/ecodata.git
```

### manually modify the occurences in ala-auth-plugin:
```
cd /home/ubuntu/.grails
grep -nrw -e 'auth.ala.org.au'

sed -i 's/auth.ala.org.au/auth.bioatlas.se/g' 2.5.6/projects/ecodata/plugins/ala-auth-1.3.1/grails-app/taglib/au/org/ala/web/auth/AuthTagLib.groovy
sed -i 's/auth.ala.org.au/auth.bioatlas.se/g' 2.5.6/projects/ecodata/plugins/ala-auth-1.3.1/AlaAuthGrailsPlugin.groovy
sed -i 's/auth.ala.org.au/auth.bioatlas.se/g' 2.5.6/projects/ecodata/plugins/ala-bootstrap2-1.2/grails-app/taglib/au/org/ala/bootstrap2/HeaderFooterTagLib.groovy
```


### INSTALL JAVA + SDK + GRAILS
```
sudo add-apt-repository ppa:openjdk-r/ppa
sudo apt-get update
sudo apt-get install openjdk-8-jdk
```
check install JAVA
```
java -version
```
(write it in /etc/profile)
```
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
```

 SDK (be sore to have instlaled zip and unzip before)
```
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install grails
sdk install grails 2.5.6
sdk use grails 2.5.6
```

# Install mongo db 3.4
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt update
sudo apt-get install -y mongodb-org=3.4.17 mongodb-org-server=3.4.17 mongodb-org-shell=3.4.17 mongodb-org-mongos=3.4.17 mongodb-org-tools=3.4.17

sudo service mongod restart
```

# install elasticsearch
```
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update
sudo apt install elasticsearch
```


# TRY AND TEST
```
grails test-app
grails run-app
```


### install tomcat8
```
sudo apt-get install tomcat8 tomcat8-admin
```
to avoid slow tomcat8 restart
```
sudo apt install haveged
```

 open port 80 for tomcat8
```
sudo nano /var/lib/tomcat8/conf/server.xml
```

CHANGE the main connector to port 80 and 443 instead of 8080 and 8443
ADD THIS:
```
<Connector port="443" protocol="org.apache.coyote.http11.Http11AprProtocol"
           maxThreads="150" SSLEnabled="true" >
    <UpgradeProtocol className="org.apache.coyote.http2.Http2Protocol" />
    <SSLHostConfig>
        <Certificate certificateKeyFile="/home/ubuntu/certs/bioatlas.se.key"
                     certificateFile="/home/ubuntu/certs/bioatlas.se.crt"
                     type="RSA" />
    </SSLHostConfig>
</Connector>
```

 upload the certs
```
scp -i /home/mathieu/.ssh/id_rsa Desktop/bioatlas.se.crt ubuntu@89.45.233.95:/home/ubuntu/certs/
scp -i /home/mathieu/.ssh/id_rsa Desktop/bioatlas.se.key ubuntu@89.45.233.95:/home/ubuntu/certs/
```


```
sudo nano /etc/default/tomcat8 
AUTHBIND=yes au lieu du no

sudo touch /etc/authbind/byport/80
sudo chmod 0755 /etc/authbind/byport/80
sudo touch /etc/authbind/byport/443
sudo chmod 0755 /etc/authbind/byport/443
sudo chown tomcat8:tomcat8 /etc/authbind/byport/80
sudo chown tomcat8:tomcat8 /etc/authbind/byport/443
sudo service tomcat8 restart
```



# create war file in ecodata
```
grails war
sudo cp target/ecodata-1.54.2.war /var/lib/tomcat8/webapps/ecodata.war
```


# Tips: clean a log file
```
truncate -s 0 M catalina.out
```

