TAG~ tag signiture 
signiture~!! | user ID [""] 
Signiture~!! | User key [""]
Argu~!! ASK | <user ID> & <user key>
Argu~!! GRAB [Key |AUTH (pull auth key password)]
Argu~!! ASK | ~!! Device [AUTHORITY]&[Time-Stamp | M%D%Y%_H%M%S%]
Argu~!! STORE | ~!! Device [SESSION ([AUTHORITY]&[Time-Stamp | M%D%Y%_H%M%S%])]
Argu~!! STORE | ~!! Device [SESSION ([AUTHORITY]&[Time-Stamp | M%D%Y%_H%M%S%])] | File-Name[""].mf
Argu~!! CHECK | ~!! {LAST!! | Device [SESSION] & [Time-Stamp] & File-Name[""].mf 
~!! Check | CORE: stored || MANIFEST.mf 
Call~ ".mf" 
Call~ Check | ALL [states]
SIGN | bundle TAG [ID]
SIGN | bundle .mf [call]
Sign | USER [ID] 
Link~!!  | ncom.core.~!! | STORE [USER]~ ALL STATES + Bundle STATES + Bundle [lst | SESSION]

Script | [1-16] RUN 
Detect~ Failure [script | [1-16]] SHOW | ERROR: UI~ "I think I had an issue with .TAG or signitures or user account Failure 
Argu~!! Detect~ Failure | START~ Debug~ ALL [states] 
Argur~!! Detect~ Failure| CHECK~!! <user ID> & <user key>
Argur~!! Detect~ Failure| CHECK~!! Device [AUTHORITY]&[Time-Stamp | M%D%Y%_H%M%S%]
Argur~!! Detect~ Failure| CHECK~!! stored || MANIFEST.mf
Argur~!! Detect~ Failure| CHECK~!! ALL [states]
Argur~!! Detect~ Failure| CHECK~!! LIST~!! dir [ALL: actions]
Argur~!! Detect~ Failure| CHECK~!! calls
Argur~!! Detect~ Failure| CHECK~!! TEST [ncom.core.~!!]
Argur~!! Detect~ Failure| CHECK~!! TEST [ncom.co]
Argur~!! Detect~ Failure| CHECK~!! SIGN | bundle TAG [ID]
Argur~!! Detect~ Failure| CHECK~!! SIGN | bundle .mf [call]
Argur~!! Build~!! Logs | detected~ ALL[Failure]
