.plx

Build~!! UI
╰──➤ Panels~
    ╰──➤ Grid~
        ╰──➤ Rows~ 3
        ╰──➤ Columns~ 8
        ╰──➤ Total~ 24
        ╰──➤ Resize~ Dynamic
        ╰──➤ Drag~ DEV_ONLY~!!
        ╰──➤ Lock~ USER~!!

Panel~!!
╰──➤ ID~ "SensorPanel"
╰──➤ Feed~ LIVE
╰──➤ Source~ sensor.temperature
╰──➤ Controls~
    ╰──➤ Show~ data
    ╰──➤ Force~ value
╰──➤ Permissions~ DEV~!!
╰──➤ Log~ ALWAYS

Panel~!!
╰──➤ ID~ "ControlPanel"
╰──➤ Feed~ LIVE
╰──➤ Source~ device.main
╰──➤ Permissions~ USER

SimCore~!!
╰──➤ Inject~ sensor
╰──➤ Override~ firmware
╰──➤ Persist~ session
╰──➤ Scope~ DEVICE | APP | OS
