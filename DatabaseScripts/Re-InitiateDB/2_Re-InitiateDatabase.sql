USE <database_name>
GO
	
/*This is an irreversible operation, only uncomment for required tables*/

/*Delete ticket related data from tables
delete from [dbo].[EMIETicketAprovals]
delete from [dbo].[EMIETickets]
delete from [dbo].[EMIETicketsArch]*/

/*Delete User and Roles data from tables
delete FROM [dbo].[UserRoleBPUMapping]
delete from [dbo].[Users]
*/

/*Delete Logger and Configuration data from tables
delete from [dbo].[Logger]
delete from [dbo].[EMIEConfigurationSettings] where ID not in (1,2)
*/

/*Delete BPU and Applications data from tables
delete from [dbo].[Applications]
delete from [dbo].[BPU]
*/

/*Re-Initiate ticket tables
DBCC CHECKIDENT('[dbo].[EMIETickets]', RESEED, 0)
DBCC CHECKIDENT('[dbo].[EMIETicketAprovals]', RESEED, 0)
*/

/*Re-Initiate Users and Roles tables
DBCC CHECKIDENT('[dbo].[Users]', RESEED, 0)
DBCC CHECKIDENT('[dbo].[UserRoleBPUMapping]', RESEED, 0)
*/

/*Re-Initiate EMIEConfiguration tables
DBCC CHECKIDENT('[dbo].[EMIEConfigurationSettings]', RESEED, 3)
*/

/*Re-Initiate Application and BPU tables
DBCC CHECKIDENT('[dbo].[Applications]', RESEED, 0)
DBCC CHECKIDENT('[dbo].[BPU]', RESEED, 0)
*/



