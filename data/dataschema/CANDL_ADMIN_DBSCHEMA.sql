USE [master]
GO
/****** Object:  Database [CLE_Admin]    Script Date: 7/18/2024 3:11:28 PM ******/
CREATE DATABASE [CLE_Admin]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'CLE_Admin', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\CLE_Admin.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'CLE_Admin_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\CLE_Admin_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [CLE_Admin] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [CLE_Admin].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [CLE_Admin] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [CLE_Admin] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [CLE_Admin] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [CLE_Admin] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [CLE_Admin] SET ARITHABORT OFF 
GO
ALTER DATABASE [CLE_Admin] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [CLE_Admin] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [CLE_Admin] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [CLE_Admin] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [CLE_Admin] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [CLE_Admin] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [CLE_Admin] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [CLE_Admin] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [CLE_Admin] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [CLE_Admin] SET  DISABLE_BROKER 
GO
ALTER DATABASE [CLE_Admin] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [CLE_Admin] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [CLE_Admin] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [CLE_Admin] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [CLE_Admin] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [CLE_Admin] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [CLE_Admin] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [CLE_Admin] SET RECOVERY FULL 
GO
ALTER DATABASE [CLE_Admin] SET  MULTI_USER 
GO
ALTER DATABASE [CLE_Admin] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [CLE_Admin] SET DB_CHAINING OFF 
GO
ALTER DATABASE [CLE_Admin] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [CLE_Admin] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [CLE_Admin] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [CLE_Admin] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'CLE_Admin', N'ON'
GO
ALTER DATABASE [CLE_Admin] SET QUERY_STORE = ON
GO
ALTER DATABASE [CLE_Admin] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [CLE_Admin]
GO
/****** Object:  User [siteUser]    Script Date: 7/18/2024 3:11:29 PM ******/
CREATE USER [siteUser] FOR LOGIN [siteUser] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [LAPTOP-8SHVUJ6V\clayh]    Script Date: 7/18/2024 3:11:29 PM ******/
CREATE USER [LAPTOP-8SHVUJ6V\clayh] FOR LOGIN [LAPTOP-8SHVUJ6V\clayh] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [admin]    Script Date: 7/18/2024 3:11:29 PM ******/
CREATE USER [admin] FOR LOGIN [admin] WITH DEFAULT_SCHEMA=[db_owner]
GO
/****** Object:  Table [dbo].[AdminUser]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AdminUser](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserEmail] [varchar](255) NULL,
	[UserPassword] [varchar](255) NULL,
	[RoleId] [int] NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRole]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRole](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [varchar](50) NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WebsiteErrorLog]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WebsiteErrorLog](
	[ErrorID] [int] IDENTITY(1,1) NOT NULL,
	[ErrorCode] [int] NULL,
	[ErrorMessage] [varchar](255) NULL,
	[ErrorDetails] [text] NULL,
	[ErrorTimestamp] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ErrorID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WebsiteLog]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WebsiteLog](
	[LogID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[IPAddress] [varchar](50) NULL,
	[RequestURL] [varchar](255) NULL,
	[HttpMethod] [varchar](10) NULL,
	[StatusCode] [int] NULL,
	[ResponseSize] [bigint] NULL,
	[UserAgent] [varchar](255) NULL,
	[Referer] [varchar](max) NULL,
	[ErrorMsg] [varchar](255) NULL,
	[QueryString] [varchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[LogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WebsiteVisits]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WebsiteVisits](
	[VisitID] [int] IDENTITY(1,1) NOT NULL,
	[IPAddress] [varchar](50) NULL,
	[VisitDateTime] [datetime] NULL,
	[PageVisited] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[VisitID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[WebsiteErrorLog] ADD  DEFAULT (getdate()) FOR [ErrorTimestamp]
GO
ALTER TABLE [dbo].[WebsiteLog] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[AdminUser]  WITH CHECK ADD FOREIGN KEY([RoleId])
REFERENCES [dbo].[UserRole] ([Id])
GO
/****** Object:  StoredProcedure [dbo].[UpdateAdminUserPassword]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateAdminUserPassword]
    @UserId INT,
    @NewPassword VARCHAR(255)
AS
BEGIN
    UPDATE AdminUser
    SET UserPassword = @NewPassword,
        DateUpdated = GETDATE()
    WHERE Id = @UserId;
END;
GO
/****** Object:  StoredProcedure [dbo].[uspGetAdminUserDataAsJSON]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[uspGetAdminUserDataAsJSON]
AS
BEGIN
    DECLARE @JSONData NVARCHAR(MAX);

    SELECT @JSONData = (
        SELECT Id, UserEmail, UserPassword, RoleId, DateCreated, DateUpdated
        FROM AdminUser
        FOR JSON AUTO
    );

    SELECT @JSONData AS AdminUserData;
END;
GO
/****** Object:  StoredProcedure [dbo].[uspGetUserRoleAsJSON]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[uspGetUserRoleAsJSON]
AS
BEGIN
    DECLARE @v_JSONData NVARCHAR(MAX);

    SELECT @v_JSONData = (
        SELECT Id, RoleName, DateCreated, DateUpdated
        FROM UserRole
        FOR JSON AUTO
    );

    SELECT @v_JSONData AS UserRoleData;
END
GO
/****** Object:  StoredProcedure [dbo].[uspGetUserRoleById]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspGetUserRoleById]
    @UserId INT
AS
BEGIN
    SELECT ur.RoleName
    FROM AdminUser au
    INNER JOIN UserRole ur ON au.RoleId = ur.Id
    WHERE au.Id = @UserId;
END
GO
/****** Object:  StoredProcedure [dbo].[uspGetWebsiteLogData]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspGetWebsiteLogData]
AS
BEGIN
    SET NOCOUNT ON;
	SELECT(
    SELECT [LogID], [Timestamp], [IPAddress], [RequestURL], [HttpMethod], [StatusCode], [ResponseSize], [UserAgent], [Referer], [ErrorMsg],[QueryString]
    FROM [CLE_Admin].[DBO].[WebsiteLog]
	FOR JSON PATH) AS 'LogData'
END

SET NOCOUNT OFF;
GO
/****** Object:  StoredProcedure [dbo].[uspInsertWebsiteErrorLog]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspInsertWebsiteErrorLog]
    @ErrorCode INT,
    @ErrorMessage VARCHAR(255),
    @ErrorDetails TEXT

AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [CLE_Admin].[dbo].[WebsiteErrorLog] (ErrorCode, ErrorMessage,ErrorDetails,ErrorTimestamp )
    VALUES (@ErrorCode ,@ErrorMessage ,@ErrorDetails,GETDATE() )
	SELECT SCOPE_IDENTITY() AS 'LogId'

END
GO
/****** Object:  StoredProcedure [dbo].[uspInsertWebsiteLog]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspInsertWebsiteLog]
    @Timestamp DATETIME,
    @IPAddress VARCHAR(50),
    @RequestURL VARCHAR(255),
    @HttpMethod VARCHAR(10),
    @StatusCode INT,
    @ResponseSize BIGINT,
    @UserAgent VARCHAR(255),
    @Referer VARCHAR(255),
    @ErrorMsg VARCHAR(255) = NULL,  -- Optional parameter for error message=
	@QueryString VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [CLE_Admin].[dbo].[WebsiteLog] (Timestamp, IPAddress, RequestURL, HttpMethod, StatusCode, ResponseSize, UserAgent, Referer, ErrorMsg,QueryString)
    VALUES (@Timestamp, @IPAddress, @RequestURL, @HttpMethod, @StatusCode, @ResponseSize, @UserAgent, @Referer, @ErrorMsg, @QueryString);
	SELECT SCOPE_IDENTITY() AS 'LogId'

END
GO
/****** Object:  StoredProcedure [dbo].[uspInsertWebSiteVisit]    Script Date: 7/18/2024 3:11:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspInsertWebSiteVisit]
    @IPAddress VARCHAR(50),
    @PageVisited VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;


    INSERT INTO [CLE_Admin].[DBO].WebsiteVisits (IPAddress, VisitDateTime, PageVisited)
    VALUES (@IPAddress, GETDATE(), @PageVisited);	SELECT SCOPE_IDENTITY() AS 'LogId'

END
GO
USE [master]
GO
ALTER DATABASE [CLE_Admin] SET  READ_WRITE 
GO
