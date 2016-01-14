#!/bin/bash

function echotables {
	#echo "---------------'IPv4 -L'----------------"
	#iptables -L
	#echo "---------------'IPv6 -L'----------------"
	#ip6tables -L
	echo "---------------'IPv4 -S'----------------"
	iptables -S
	echo "---------------'IPv6 -S'----------------"
	ip6tables -S
	echo "------------------------------------------"
}

echo "TABLES ARE INITIALLY:"
echotables

# Reset existing tables.
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT
iptables -F

ip6tables -P INPUT ACCEPT
ip6tables -P FORWARD ACCEPT
ip6tables -P OUTPUT ACCEPT
ip6tables -F

echo "TABLES ARE RESET TO:"
echotables

#IPv4
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
#SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
#HTTP
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
#HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
#SMTP
iptables -A INPUT -p tcp --dport 465 -j ACCEPT
#WebSocket
iptables -A INPUT -p tcp --dport 8001 -j ACCEPT
iptables -A INPUT -p tcp --dport 8002 -j ACCEPT
iptables -A INPUT -p tcp --dport 8003 -j ACCEPT
iptables -A INPUT -p tcp --dport 8004 -j ACCEPT
iptables -A INPUT -p tcp --dport 8005 -j ACCEPT
iptables -A INPUT -p tcp --dport 8006 -j ACCEPT
iptables -A INPUT -j DROP

#IPv6
ip6tables -A INPUT -i lo -j ACCEPT
ip6tables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
#SSH
ip6tables -A INPUT -p tcp --dport 22 -j ACCEPT
#HTTP
ip6tables -A INPUT -p tcp --dport 80 -j ACCEPT
#HTTPS
ip6tables -A INPUT -p tcp --dport 443 -j ACCEPT
#SMTP
ip6tables -A INPUT -p tcp --dport 465 -j ACCEPT
#WebSocket
ip6tables -A INPUT -p tcp --dport 8001 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 8002 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 8003 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 8004 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 8005 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 8006 -j ACCEPT
ip6tables -A INPUT -j DROP

echo "TABLES ARE NOW SET TO:"
echotables