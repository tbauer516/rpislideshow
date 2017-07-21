#!/bin/bash

echo "#!/bin/bash" > live.sh
DIR=$(pwd)
echo "cd $DIR" >> live.sh
echo 'lxterminal -e "bash -c \"npm start; bash\""' >> live.sh

chmod +x live.sh