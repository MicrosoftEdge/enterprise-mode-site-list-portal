----------------------------------------------------------------------------------------------------------------------
                       ********** Steps to install Service on machine ***********
----------------------------------------------------------------------------------------------------------------------

1) Run Visual studio development command prompt as administrator

2) Change directory to the path of Installutil.exe For e.g. if exe is available at path C:\Windows\Microsoft.NET\Framework\v4.0.30319\InstallUtil.exe
   then run command cd "C:\Windows\Microsoft.NET\Framework\v4.0.30319\"

3) Copy App_Data,bin and Logs folder to server at any location   

4) Run command installutil "path of service exe". For e.g. installutil "c:/EMIE/EMIEWebPortal.SchedulerService.exe"

5) It will ask for credential, give your credentials/Administrator's credential

6) Go to services.msc, Start the service with name 'EMIEScheduler'

----------------------------------------------------------------------------------------------------------------------
                                  *********** Note ***********
----------------------------------------------------------------------------------------------------------------------

1) User can see details of scheduler status in the log file 'EMIESchedulerLog.txt' in 'Logs' folder.

2) User can configure time interval between each run of scheduler by setting value of 
  key 'SchedulerWaitTimeInMinutes' in 'EMIEWebPortal.SchedulerService.exe.config' file in bin folder of service.


