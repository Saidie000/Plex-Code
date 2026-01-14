.plx

ASK~!! | SENSOR_ACCESS
╰──➤ ACCESS~!! | DEVICE

Sniff~ [ALL] | SENSORS
╰──➤ detect~!! | sensors
    ╰──➤ Fetch~!! needed firmware [sensors]
    ╰──➤ Store~ @.attributes

Pair~ | Device~!!
╰──➤ Sniff~ device | ID~!!
    ╰──➤ sniff~
        ╰──➤ sensors~!! | UWB

SEND~!! | device | sensor_data
Store~ @pair
