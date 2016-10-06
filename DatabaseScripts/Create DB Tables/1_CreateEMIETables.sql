Use <database_name>;
Go
/****** Object:  Table [dbo].[BPU]    Script Date: 9/1/2016 1:46:43 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BPU](
	[BPUId] [int] IDENTITY(0,1) NOT NULL,
	[BPU] [nvarchar](50) NOT NULL,
	[BPUFullName] [nvarchar](150) NULL,
	[OwningOrganization] [nvarchar](150) NULL,
	[BPUTestLeadId] [int] NULL,
	[RedmondLeadId] [int] NULL,
	[EspooLeadId] [int] NULL,
	[EngineeringTeamMembers] [nvarchar](200) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_BPUDetails] PRIMARY KEY CLUSTERED 
(
	[BPUId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[Browsers]    Script Date: 9/1/2016 1:49:11 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

Insert into [dbo].[BPU] (BPU,IsActive) values ('All',1)
GO

/****** Object:  Table [dbo].[Browsers]    Script Date: 9/1/2016 1:52:25 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Browsers](
	[BrowserId] [int] IDENTITY(1,1) NOT NULL,
	[BrowserName] [nvarchar](50) NOT NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_Browsers] PRIMARY KEY CLUSTERED 
(
	[BrowserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET IDENTITY_INSERT [dbo].[Browsers] ON 

GO
INSERT [dbo].[Browsers] ([BrowserId], [BrowserName], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (1, N'IE11', NULL, NULL, NULL, NULL, 1)
GO
INSERT [dbo].[Browsers] ([BrowserId], [BrowserName], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (2, N'MicrosoftEdge', NULL, NULL, NULL, NULL, 1)
GO
INSERT [dbo].[Browsers] ([BrowserId], [BrowserName], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (3, N'None', NULL, NULL, NULL, NULL, 1)
GO
SET IDENTITY_INSERT [dbo].[Browsers] OFF
GO

/****** Object:  Table [dbo].[DocModes]    Script Date: 9/1/2016 1:54:49 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DocModes](
	[DocModeId] [int] NOT NULL,
	[DocMode] [nvarchar](300) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_EMIEDocModes] PRIMARY KEY CLUSTERED 
(
	[DocModeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (1, N'Default', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (2, N'IE7Enterprise', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (3, N'IE8Enterprise', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (4, N'IE5', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (5, N'IE7', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (6, N'IE8', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (7, N'IE9', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (8, N'IE10', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[DocModes] ([DocModeId], [DocMode], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (9, N'IE11', NULL, NULL, NULL, NULL, 1)

/****** Object:  Table [dbo].[EMIEChangeType]    Script Date: 9/1/2016 1:54:49 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EMIEChangeType](
	[ChangeTypeId] [int] IDENTITY(1,1) NOT NULL,
	[ChangeType] [nvarchar](300) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_EMIEChangeType] PRIMARY KEY CLUSTERED 
(
	[ChangeTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

SET IDENTITY_INSERT [dbo].[EMIEChangeType] ON 
GO
INSERT [dbo].[EMIEChangeType] ([ChangeTypeId], [ChangeType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (1, N'Add to EMIE', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEChangeType] ([ChangeTypeId], [ChangeType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (2, N'Delete from EMIE', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEChangeType] ([ChangeTypeId], [ChangeType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (3, N'Update to EMIE', NULL, NULL, NULL, NULL, 1)
SET IDENTITY_INSERT [dbo].[EMIEChangeType] OFF
GO

/****** Object:  Table [dbo].[EMIEReasonForChange]    Script Date: 9/1/2016 1:54:49 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EMIEReasonForChange](
	[ReasonForChangeId] [int] IDENTITY(1,1) NOT NULL,
	[ReasonForChange] [nvarchar](300) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_EMIEReasonForChange] PRIMARY KEY CLUSTERED 
(
	[ReasonForChangeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET IDENTITY_INSERT [dbo].[EMIEReasonForChange] ON 
GO
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (1, N'SilverLight Issue', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (2, N'Deprecated API', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (3, N'Others', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (4, N'Authentication/SSO', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (5, N'Broken Functionality', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (6, N'Crashes / Hangs', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (7, N'Content Missing', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (8, N'Browser Feature Missing', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (9, N'DocMode Dependency', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (10, N'Modal Dialog', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (11, N'Notifications (Pop-up/Gold Bar)', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (12, N'Plugins (ActiveX/Silverlight/Others)', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (13, N'UA String Dependency', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIEReasonForChange] ([ReasonForChangeId], [ReasonForChange], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (14, N'Usability and User Experience', NULL, NULL, NULL, NULL, 1)
SET IDENTITY_INSERT [dbo].[EMIEReasonForChange] OFF 
GO

/****** Object:  Table [dbo].[EMIETicketState]    Script Date: 9/1/2016 1:54:49 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EMIETicketState](
	[TicketStateId] [int] IDENTITY(1,1) NOT NULL,
	[TicketState] [nvarchar](200) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_EMIETicketState] PRIMARY KEY CLUSTERED 
(
	[TicketStateId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET IDENTITY_INSERT [dbo].[EMIETicketState] ON 
GO

INSERT [dbo].[EMIETicketState] ([TicketStateId], [TicketState], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (1, N'Initiated', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketState] ([TicketStateId], [TicketState], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (2, N'VerifiedOnTestMachine', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketState] ([TicketStateId], [TicketState], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (3, N'Pending', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketState] ([TicketStateId], [TicketState], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (4, N'Approved', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketState] ([TicketStateId], [TicketState], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (5, N'Rejected', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketState] ([TicketStateId], [TicketState], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (6, N'VerificationFailedTestMachine', NULL, NULL, NULL, NULL, 1)
SET IDENTITY_INSERT [dbo].[EMIETicketState] OFF 
GO
/****** Object:  Table [dbo].[EMIETicketStatus]    Script Date: 9/1/2016 1:54:49 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EMIETicketStatus](
	[TicketStatusId] [int] IDENTITY(1,1) NOT NULL,
	[TicketStatus] [nvarchar](200) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_EMIETicketStatus] PRIMARY KEY CLUSTERED 
(
	[TicketStatusId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET IDENTITY_INSERT [dbo].[EMIETicketStatus] ON 
GO
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (1, N'Initiated', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (2, N'VerifiedOnTestMachine', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (3, N'ApprovalPending', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (4, N'PartiallyApproved', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (5, N'Approved', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (6, N'Rejected', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (7, N'ProductionReady', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (8, N'SignedOff', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (9, N'RolledBack', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (10, N'VerificationFailedTestMachine', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (11, N'Closed', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[EMIETicketStatus] ([TicketStatusId], [TicketStatus], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (12, N'ProductionChangesScheduled', NULL, NULL, NULL, NULL, 1)
SET IDENTITY_INSERT [dbo].[EMIETicketStatus] OFF 
GO
/****** Object:  Table [dbo].[IssueType]    Script Date: 9/1/2016 1:54:49 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[IssueType](
	[IssueTypeId] [int] IDENTITY(1,1) NOT NULL,
	[IssueType] [nvarchar](150) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_IssueType] PRIMARY KEY CLUSTERED 
(
	[IssueTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

SET IDENTITY_INSERT [dbo].[IssueType] ON 
GO
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (1, N'Broken Functionality', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (2, N'Crashes / Hangs', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (3, N'Content Missing', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (4, N'DocMode Dependency', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (5, N'Feature Missing', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (6, N'Layout and UI', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (7, N'Modal Dialog', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (8, N'Notifications (Pop-up/Gold Bar)', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (9, N'Office Integration', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (10, N'Plugins (ActiveX/Silverlight/Others)', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (11, N'UA String Dependency', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (12, N'Usability and User Experience', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (13, N'Others (Update issue details in Comments)', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (14, N'Blocked', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (15, N'Authentication', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (16, N'Broken Controls', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (17, N'Certificate', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (18, N'EMIE Site Redirection', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (19, N'(JavaScript/VBScript/Other)', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[IssueType] ([IssueTypeId], [IssueType], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (20, N'Site Rendering', NULL, NULL, NULL, NULL, 1)
SET IDENTITY_INSERT [dbo].[IssueType] OFF 
GO

/****** Object:  Table [dbo].[NoOfUsers]    Script Date: 9/1/2016 1:54:49 AM ******/
SET ANSI_NULLS ON
GO

CREATE TABLE [dbo].[NoOfUsers](
	[NoOfUsersId] [int] NOT NULL,
	[NoOfUsers] [nvarchar](150) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_NoOfUsers] PRIMARY KEY CLUSTERED 
(
	[NoOfUsersId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

INSERT [dbo].[NoOfUsers] ([NoOfUsersId], [NoOfUsers], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (1, N'10-100', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[NoOfUsers] ([NoOfUsersId], [NoOfUsers], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (2, N'100-500', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[NoOfUsers] ([NoOfUsersId], [NoOfUsers], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (3, N'500-1000', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[NoOfUsers] ([NoOfUsersId], [NoOfUsers], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (4, N'1000-5000', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[NoOfUsers] ([NoOfUsersId], [NoOfUsers], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (5, N'5000-10000', NULL, NULL, NULL, NULL, 1)
INSERT [dbo].[NoOfUsers] ([NoOfUsersId], [NoOfUsers], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive]) VALUES (6, N'>10000', NULL, NULL, NULL, NULL, 1)


/****** Object:  Table [dbo].[Roles]    Script Date: 9/1/2016 1:54:49 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Roles](
	[RoleId] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [varchar](500) NULL,
	[RoleDetails] [varchar](500) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
	[RolePriority] [int] NULL,
	[MandatoryApproval] [bit] NULL,
 CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED 
(
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET IDENTITY_INSERT [dbo].[Roles] ON 
GO
INSERT [dbo].[Roles] ([RoleId], [RoleName], [RoleDetails], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive], [RolePriority], [MandatoryApproval]) VALUES (1, N'Requester', N'EMIE Requester', NULL, NULL, NULL, NULL, 1, 1, 1)
INSERT [dbo].[Roles] ([RoleId], [RoleName], [RoleDetails], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive], [RolePriority], [MandatoryApproval]) VALUES (2, N'App Manager', N'EMIE Approver', NULL, NULL, NULL, NULL, 1, 2, 1)
INSERT [dbo].[Roles] ([RoleId], [RoleName], [RoleDetails], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive], [RolePriority], [MandatoryApproval]) VALUES (3, N'Group Head', N'EMIE Approver', NULL, NULL, NULL, NULL, 1, 2, 1)
INSERT [dbo].[Roles] ([RoleId], [RoleName], [RoleDetails], [CreatedById], [CreatedDate], [ModifiedById], [ModifiedDate], [IsActive], [RolePriority], [MandatoryApproval]) VALUES (4, N'EMIE Champion', N'EMIE Admin', NULL, NULL, NULL, NULL, 1, 3, 1)
SET IDENTITY_INSERT [dbo].[Roles] OFF 
GO

/****** Object:  Table [dbo].[EMIEConfigurationSettings]    Script Date: 9/1/2016 2:34:31 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[EMIEConfigurationSettings](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ConfigItem] [nvarchar](200) NULL,
	[ConfiguredValue] [nvarchar](500) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_EMIEConfigurationSettings] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO


/****** Object:  Table [dbo].[Users]    Script Date: 9/1/2016 2:41:22 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[Users](
	[UserId] [int] IDENTITY(1,1) NOT NULL,
	[UserName] [varchar](500) NULL,
	[Email] [varchar](500) NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[IsActive] [bit] NULL,
	[Password] [nvarchar](50) NULL,
	[LoginId] [nvarchar](50) NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO


/****** Object:  Table [dbo].[Applications]    Script Date: 10/4/2016 3:16:14 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[Applications](
	[AppId] [int] IDENTITY(1,1) NOT NULL,
	[Application] [varchar](500) NOT NULL,
	[Windows] [varchar](30) NULL,
	[Web] [varchar](30) NULL,
	[Office] [varchar](30) NULL,
	[ETTOwned] [int] NULL,
	[ProjectCategoryId] [int] NULL,
	[BPUId] [int] NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[ApplicationStateId] [int] NULL,
	[Comments] [nvarchar](200) NULL,
 CONSTRAINT [PK_Applications] PRIMARY KEY CLUSTERED 
(
	[AppId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[Applications]  WITH CHECK ADD  CONSTRAINT [FK_Applications_BPU] FOREIGN KEY([BPUId])
REFERENCES [dbo].[BPU] ([BPUId])
GO

ALTER TABLE [dbo].[Applications] CHECK CONSTRAINT [FK_Applications_BPU]
GO

ALTER TABLE [dbo].[Applications]  WITH CHECK ADD  CONSTRAINT [FK_Applications_Users] FOREIGN KEY([CreatedById])
REFERENCES [dbo].[Users] ([UserId])
GO

ALTER TABLE [dbo].[Applications] CHECK CONSTRAINT [FK_Applications_Users]
GO



/****** Object:  Table [dbo].[UserRoleBPUMapping]    Script Date: 9/1/2016 2:41:43 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[UserRoleBPUMapping](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[BPUId] [int] NOT NULL,
	[RoleId] [int] NOT NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[MappingDetails] [nvarchar](100) NULL,
	[IsActive] [bit] NULL,
	[IsRegistered] [bit] NULL,
 CONSTRAINT [PK_UserRoleBPUMapping] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[UserRoleBPUMapping]  WITH CHECK ADD  CONSTRAINT [FK_UserRoleBPUMapping_BPU] FOREIGN KEY([BPUId])
REFERENCES [dbo].[BPU] ([BPUId])
GO

ALTER TABLE [dbo].[UserRoleBPUMapping] CHECK CONSTRAINT [FK_UserRoleBPUMapping_BPU]
GO

ALTER TABLE [dbo].[UserRoleBPUMapping]  WITH CHECK ADD  CONSTRAINT [FK_UserRoleBPUMapping_Roles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([RoleId])
GO

ALTER TABLE [dbo].[UserRoleBPUMapping] CHECK CONSTRAINT [FK_UserRoleBPUMapping_Roles]
GO

ALTER TABLE [dbo].[UserRoleBPUMapping]  WITH CHECK ADD  CONSTRAINT [FK_UserRoleBPUMapping_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO

ALTER TABLE [dbo].[UserRoleBPUMapping] CHECK CONSTRAINT [FK_UserRoleBPUMapping_Users]
GO

/****** Object:  Table [dbo].[Logger]    Script Date: 9/1/2016 2:43:03 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Logger](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[LoggedOn] [smalldatetime] NULL,
	[ActionMethod] [nvarchar](100) NULL,
	[Description] [nvarchar](500) NULL,
	[Operation] [nvarchar](50) NULL,
	[ProductCategory] [nvarchar](100) NULL,
 CONSTRAINT [PK_Logger] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO



/****** Object:  Table [dbo].[EMIETicketsArch]    Script Date: 10/3/2016 11:45:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[EMIETicketsArch](
	[TicketId] [int] NOT NULL,
	[AppId] [int] NOT NULL,
	[BPUId] [int] NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ChangeTypeId] [int] NOT NULL,
	[ReasonForChangeId] [int] NULL,
	[Comments] [nvarchar](300) NULL,
	[BusinessImpact] [nvarchar](200) NULL,
	[DocModeId] [int] NULL,
	[X_UAMetaTage] [bit] NULL,
	[X_UAMetaTageDetails] [nvarchar](200) NULL,
	[X_UAHonor] [bit] NULL,
	[MultipleX_UA] [bit] NULL,
	[ExternalFacingSite] [bit] NULL,
	[FQDN] [nvarchar](200) NULL,
	[AppSiteLink] [nvarchar](200) NULL,
	[FinalCRStatusId] [int] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[ProductionDeployDateStart] [smalldatetime] NULL,
	[ProductionDeployDateEnd] [smalldatetime] NULL,
	[SandBoxFailureComments] [nvarchar](500) NULL,
	[ProductionSuccessComments] [nvarchar](500) NULL,
	[ProductionFailureComments] [nvarchar](500) NULL,
	[SandboxRollback] [bit] NULL,
	[ProductionRollback] [bit] NULL,
	[SubDomainSiteLink] [nvarchar](200) NULL,
	[SubDomainDocModeId] [int] NULL,
	[SubDomainX_UAHonor] [bit] NULL,
	[DomainOpenInEdge] [bit] NULL,
	[SubDomainOpenInEdge] [bit] NULL,
	[RejectedReason] [nvarchar](200) NULL,
 CONSTRAINT [PK_EMIETicketsArch] PRIMARY KEY CLUSTERED 
(
	[TicketId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketArch_BPU] FOREIGN KEY([BPUId])
REFERENCES [dbo].[BPU] ([BPUId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketArch_BPU]
GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketArch_ChangeType] FOREIGN KEY([ChangeTypeId])
REFERENCES [dbo].[EMIEChangeType] ([ChangeTypeId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketArch_ChangeType]
GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketArch_DocMode] FOREIGN KEY([DocModeId])
REFERENCES [dbo].[DocModes] ([DocModeId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketArch_DocMode]
GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketArch_ReasonForChange] FOREIGN KEY([ReasonForChangeId])
REFERENCES [dbo].[EMIEReasonForChange] ([ReasonForChangeId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketArch_ReasonForChange]
GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketArch_TicketState] FOREIGN KEY([FinalCRStatusId])
REFERENCES [dbo].[EMIETicketStatus] ([TicketStatusId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketArch_TicketState]
GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketsArch_Applications] FOREIGN KEY([AppId])
REFERENCES [dbo].[Applications] ([AppId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketsArch_Applications]
GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketsArch_DocModes] FOREIGN KEY([DocModeId])
REFERENCES [dbo].[DocModes] ([DocModeId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketsArch_DocModes]
GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketsArch_SubDomainDocModes] FOREIGN KEY([SubDomainDocModeId])
REFERENCES [dbo].[DocModes] ([DocModeId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketsArch_SubDomainDocModes]
GO

ALTER TABLE [dbo].[EMIETicketsArch]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketsArch_Users] FOREIGN KEY([CreatedById])
REFERENCES [dbo].[Users] ([UserId])
GO

ALTER TABLE [dbo].[EMIETicketsArch] CHECK CONSTRAINT [FK_EMIETicketsArch_Users]
GO


/****** Object:  Table [dbo].[EMIETickets]    Script Date: 10/2/2016 10:04:58 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[EMIETickets](
	[TicketId] [int] IDENTITY(1,1) NOT NULL,
	[AppId] [int] NOT NULL,
	[BPUId] [int] NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ChangeTypeId] [int] NOT NULL,
	[ReasonForChangeId] [int] NULL,
	[Comments] [nvarchar](300) NULL,
	[BusinessImpact] [nvarchar](200) NULL,
	[DocModeId] [int] NULL,
	[X_UAMetaTage] [bit] NULL,
	[X_UAMetaTageDetails] [nvarchar](200) NULL,
	[X_UAHonor] [bit] NULL,
	[MultipleX_UA] [bit] NULL,
	[ExternalFacingSite] [bit] NULL,
	[FQDN] [nvarchar](200) NULL,
	[AppSiteLink] [nvarchar](200) NULL,
	[FinalCRStatusId] [int] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
	[ProductionDeployDateStart] [smalldatetime] NULL,
	[ProductionDeployDateEnd] [smalldatetime] NULL,
	[SandBoxFailureComments] [nvarchar](500) NULL,
	[ProductionSuccessComments] [nvarchar](500) NULL,
	[ProductionFailureComments] [nvarchar](500) NULL,
	[SubDomainSiteLink] [nvarchar](200) NULL,
	[SubDomainDocModeId] [int] NULL,
	[SubDomainX_UAHonor] [bit] NULL,
	[DomainOpenInEdge] [bit] NULL,
	[SubDomainOpenInEdge] [bit] NULL,
	[RejectedReason] [nvarchar](200) NULL,
 CONSTRAINT [PK_EMIETickets] PRIMARY KEY CLUSTERED 
(
	[TicketId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[EMIETickets]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicket_TicketState] FOREIGN KEY([FinalCRStatusId])
REFERENCES [dbo].[EMIETicketStatus] ([TicketStatusId])
GO

ALTER TABLE [dbo].[EMIETickets] CHECK CONSTRAINT [FK_EMIETicket_TicketState]
GO

ALTER TABLE [dbo].[EMIETickets]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketAprovals_BPU] FOREIGN KEY([BPUId])
REFERENCES [dbo].[BPU] ([BPUId])
GO

ALTER TABLE [dbo].[EMIETickets] CHECK CONSTRAINT [FK_EMIETicketAprovals_BPU]
GO

ALTER TABLE [dbo].[EMIETickets]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketAprovals_ChangeType] FOREIGN KEY([ChangeTypeId])
REFERENCES [dbo].[EMIEChangeType] ([ChangeTypeId])
GO

ALTER TABLE [dbo].[EMIETickets] CHECK CONSTRAINT [FK_EMIETicketAprovals_ChangeType]
GO

ALTER TABLE [dbo].[EMIETickets]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketAprovals_DocMode] FOREIGN KEY([DocModeId])
REFERENCES [dbo].[DocModes] ([DocModeId])
GO

ALTER TABLE [dbo].[EMIETickets] CHECK CONSTRAINT [FK_EMIETicketAprovals_DocMode]
GO

ALTER TABLE [dbo].[EMIETickets]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketAprovals_ReasonForChange] FOREIGN KEY([ReasonForChangeId])
REFERENCES [dbo].[EMIEReasonForChange] ([ReasonForChangeId])
GO

ALTER TABLE [dbo].[EMIETickets] CHECK CONSTRAINT [FK_EMIETicketAprovals_ReasonForChange]
GO

ALTER TABLE [dbo].[EMIETickets]  WITH CHECK ADD  CONSTRAINT [FK_EMIETickets_Applications] FOREIGN KEY([AppId])
REFERENCES [dbo].[Applications] ([AppId])
GO

ALTER TABLE [dbo].[EMIETickets] CHECK CONSTRAINT [FK_EMIETickets_Applications]
GO

ALTER TABLE [dbo].[EMIETickets]  WITH CHECK ADD  CONSTRAINT [FK_EMIETickets_DocModes] FOREIGN KEY([DocModeId])
REFERENCES [dbo].[DocModes] ([DocModeId])
GO

ALTER TABLE [dbo].[EMIETickets] CHECK CONSTRAINT [FK_EMIETickets_DocModes]
GO

ALTER TABLE [dbo].[EMIETickets]  WITH CHECK ADD  CONSTRAINT [FK_EMIETickets_SubDomainDocModes] FOREIGN KEY([SubDomainDocModeId])
REFERENCES [dbo].[DocModes] ([DocModeId])
GO

ALTER TABLE [dbo].[EMIETickets] CHECK CONSTRAINT [FK_EMIETickets_SubDomainDocModes]
GO


/****** Object:  Table [dbo].[EMIETicketAprovals]    Script Date: 9/1/2016 2:45:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[EMIETicketAprovals](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TicketId] [int] NOT NULL,
	[UserRoleBPUMappingId] [int] NULL,
	[ApproverComments] [nvarchar](300) NULL,
	[TicketStateId] [int] NULL,
	[NoOfReminders] [int] NULL,
	[CreatedById] [int] NULL,
	[CreatedDate] [smalldatetime] NULL,
	[ModifiedById] [int] NULL,
	[ModifiedDate] [smalldatetime] NULL,
 CONSTRAINT [PK_EMIETicketAprovals] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[EMIETicketAprovals]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketAprovals_EMIETickets] FOREIGN KEY([TicketId])
REFERENCES [dbo].[EMIETickets] ([TicketId])
GO

ALTER TABLE [dbo].[EMIETicketAprovals] CHECK CONSTRAINT [FK_EMIETicketAprovals_EMIETickets]
GO

ALTER TABLE [dbo].[EMIETicketAprovals]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketAprovals_TicketState] FOREIGN KEY([TicketStateId])
REFERENCES [dbo].[EMIETicketState] ([TicketStateId])
GO

ALTER TABLE [dbo].[EMIETicketAprovals] CHECK CONSTRAINT [FK_EMIETicketAprovals_TicketState]
GO

ALTER TABLE [dbo].[EMIETicketAprovals]  WITH CHECK ADD  CONSTRAINT [FK_EMIETicketAprovals_UserRoleBPUMapping] FOREIGN KEY([UserRoleBPUMappingId])
REFERENCES [dbo].[UserRoleBPUMapping] ([ID])
GO

ALTER TABLE [dbo].[EMIETicketAprovals] CHECK CONSTRAINT [FK_EMIETicketAprovals_UserRoleBPUMapping]
GO


/*Create Master Admin User for AdminConsole*/
Insert into [dbo].[EMIEConfigurationSettings] ([ConfigItem]
      ,[ConfiguredValue]
      ,[IsActive]) values ('MasterEMIEAdmin','EMIEAdmin',1)
GO
Insert into [dbo].[EMIEConfigurationSettings] ([ConfigItem]
      ,[ConfiguredValue]
      ,[IsActive]) values ('MasterEMIEAdminPassword','pGAVmik3/Jcv1kkdl44zNoluk3mzs4wkli7Dl9/lc6g=',1)
GO