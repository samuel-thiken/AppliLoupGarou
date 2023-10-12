import time
import sys
 
n = float(sys.argv[1])
print(int(time.time()*1000 + 60*1000*n))