"""Trouve l'adresse IPv4 locale utilisee pour joindre le reseau.
Aucun paquet n'est envoye : le socket UDP sert seulement a choisir la route.
"""
import socket

ip = ""
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    sock.connect(("192.168.1.1", 80))
    ip = sock.getsockname()[0]
except OSError:
    try:
        ip = socket.gethostbyname(socket.gethostname())
    except OSError:
        ip = ""
finally:
    sock.close()

if ip.startswith("127."):
    ip = ""

print(ip)
