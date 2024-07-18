USE [master]
GO
/****** Object:  Database [CLE_Client]    Script Date: 7/18/2024 3:01:54 PM ******/
CREATE DATABASE [CLE_Client]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'CLE_Client', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\CLE_Client.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'CLE_Client_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\CLE_Client_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [CLE_Client] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [CLE_Client].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [CLE_Client] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [CLE_Client] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [CLE_Client] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [CLE_Client] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [CLE_Client] SET ARITHABORT OFF 
GO
ALTER DATABASE [CLE_Client] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [CLE_Client] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [CLE_Client] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [CLE_Client] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [CLE_Client] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [CLE_Client] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [CLE_Client] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [CLE_Client] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [CLE_Client] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [CLE_Client] SET  DISABLE_BROKER 
GO
ALTER DATABASE [CLE_Client] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [CLE_Client] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [CLE_Client] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [CLE_Client] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [CLE_Client] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [CLE_Client] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [CLE_Client] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [CLE_Client] SET RECOVERY FULL 
GO
ALTER DATABASE [CLE_Client] SET  MULTI_USER 
GO
ALTER DATABASE [CLE_Client] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [CLE_Client] SET DB_CHAINING OFF 
GO
ALTER DATABASE [CLE_Client] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [CLE_Client] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [CLE_Client] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [CLE_Client] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'CLE_Client', N'ON'
GO
ALTER DATABASE [CLE_Client] SET QUERY_STORE = ON
GO
ALTER DATABASE [CLE_Client] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [CLE_Client]
GO
/****** Object:  User [siteUser]    Script Date: 7/18/2024 3:01:55 PM ******/
CREATE USER [siteUser] FOR LOGIN [siteUser] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [LAPTOP-8SHVUJ6V\clayh]    Script Date: 7/18/2024 3:01:55 PM ******/
CREATE USER [LAPTOP-8SHVUJ6V\clayh] FOR LOGIN [LAPTOP-8SHVUJ6V\clayh] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [AdminUser]    Script Date: 7/18/2024 3:01:55 PM ******/
CREATE USER [AdminUser] FOR LOGIN [admin] WITH DEFAULT_SCHEMA=[db_accessadmin]
GO
USE [CLE_Client]
GO
/****** Object:  Sequence [dbo].[UniqueNumberSeq]    Script Date: 7/18/2024 3:01:55 PM ******/
CREATE SEQUENCE [dbo].[UniqueNumberSeq] 
 AS [int]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -2147483648
 MAXVALUE 2147483647
 CACHE 
GO
/****** Object:  UserDefinedFunction [dbo].[GenerateUniqueInvNumber]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


	-- Create a function to generate the unique 5-digit number
CREATE FUNCTION [dbo].[GenerateUniqueInvNumber](@ClientID INT)
RETURNS NVARCHAR(12)
AS
BEGIN
	DECLARE @InvDate	VARCHAR(12)
	SET @InvDate =  FORMAT(getdate(), 'yyyyMMdd')
	DECLARE @InvValue	INT
	SET @InvValue = CONCAT(@InvDate,@ClientId)

    DECLARE @UniqueNumber NVARCHAR(10);
    SET @UniqueNumber = FORMAT(@InvValue, '00');
    RETURN @UniqueNumber;
END

GO
/****** Object:  Table [dbo].[BillingInvoice]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BillingInvoice](
	[InvoiceID] [int] IDENTITY(1,1) NOT NULL,
	[ClientID] [int] NULL,
	[InvoiceDate] [date] NULL,
	[DueDate] [date] NULL,
	[Amount] [decimal](18, 2) NULL,
	[CurBalance] [decimal](18, 2) NULL,
	[AdjustBalance] [decimal](18, 2) NULL,
	[StatusId] [int] NULL,
	[PaymentDate] [date] NULL,
	[Notes] [text] NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
	[InvoiceNum] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[InvoiceID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Client]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Client](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[FirstName] [varchar](100) NULL,
	[LastName] [varchar](100) NULL,
	[CompanyName] [varchar](255) NULL,
	[ClientContactId] [int] NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
	[CustomerAddressId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ClientAssistRequest]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ClientAssistRequest](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CompanyName] [varchar](100) NULL,
	[FirstName] [varchar](50) NULL,
	[LastName] [varchar](50) NULL,
	[EmailAddress] [varchar](100) NULL,
	[BusinessPhone] [varchar](20) NULL,
	[Extension] [varchar](10) NULL,
	[Description] [varchar](max) NULL,
	[ClientContacted] [bit] NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
 CONSTRAINT [PK_ClientAssistRequest] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ClientContact]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ClientContact](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[EmailAddress] [varchar](255) NULL,
	[BusinessPhone] [varchar](20) NULL,
	[PersonalPhone] [varchar](20) NULL,
	[CellPhone] [varchar](20) NULL,
	[ContactPreference] [varchar](50) NULL,
	[Extension] [varchar](10) NULL,
	[CreatedDate] [datetime] NULL,
	[UpdatedDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[EmailAddress] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ClientLogin]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ClientLogin](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ClientId] [int] NULL,
	[userEmail] [varchar](255) NULL,
	[userPassword] [varchar](255) NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ClientSpecialOffer]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ClientSpecialOffer](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ClientId] [int] NULL,
	[OfferId] [int] NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CompanyServices]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CompanyServices](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ServiceName] [varchar](255) NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CountryCodes]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CountryCodes](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CountryCode] [varchar](2) NULL,
	[CountryName] [varchar](255) NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CustomerAddress]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerAddress](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[AddressLine1] [varchar](255) NOT NULL,
	[AddressLine2] [varchar](255) NULL,
	[City] [varchar](100) NOT NULL,
	[State] [varchar](100) NOT NULL,
	[ZipCode] [varchar](20) NOT NULL,
	[CountryCodeId] [varchar](3) NOT NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CustomerBillingInformation]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerBillingInformation](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ClientID] [int] NULL,
	[BillingAddress] [varchar](255) NULL,
	[BillingCity] [varchar](100) NULL,
	[BillingState] [varchar](100) NULL,
	[BillingZipCode] [varchar](20) NULL,
	[CreditCardNumber] [varchar](20) NULL,
	[ExpiryDate] [date] NULL,
	[CVV] [varchar](10) NULL,
	[BillingDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OfferRate]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OfferRate](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Rate] [varchar](50) NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PaymentStatus]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaymentStatus](
	[StatusID] [int] IDENTITY(1,1) NOT NULL,
	[StatusName] [varchar](50) NOT NULL,
	[Description] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[StatusID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QuoteInformation]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QuoteInformation](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ServiceTypeId] [int] NULL,
	[ProjectDescription] [text] NULL,
	[EstimatedCost] [decimal](10, 2) NULL,
	[EstimatedTimeline] [nvarchar](100) NULL,
	[AdditionalNotes] [text] NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
	[CompanyName] [varchar](100) NULL,
	[FirstName] [varchar](100) NULL,
	[LastName] [varchar](100) NULL,
	[EmailAddress] [nvarchar](255) NULL,
	[BusinessPhone] [nvarchar](20) NULL,
	[ContactPreference] [nvarchar](50) NULL,
	[Extension] [nvarchar](10) NULL,
	[Status] [varchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SpecialOffer]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SpecialOffer](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[OfferName] [varchar](255) NULL,
	[OfferDetails] [text] NULL,
	[OfferRateId] [int] NULL,
	[OfferStartDate] [date] NULL,
	[OfferEndDate] [date] NULL,
	[DateCreated] [datetime] NULL,
	[DateUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[BillingInvoice]  WITH CHECK ADD FOREIGN KEY([ClientID])
REFERENCES [dbo].[Client] ([Id])
GO
ALTER TABLE [dbo].[BillingInvoice]  WITH CHECK ADD FOREIGN KEY([StatusId])
REFERENCES [dbo].[PaymentStatus] ([StatusID])
GO
ALTER TABLE [dbo].[Client]  WITH CHECK ADD FOREIGN KEY([ClientContactId])
REFERENCES [dbo].[ClientContact] ([Id])
GO
ALTER TABLE [dbo].[ClientLogin]  WITH CHECK ADD FOREIGN KEY([ClientId])
REFERENCES [dbo].[Client] ([Id])
GO
ALTER TABLE [dbo].[ClientSpecialOffer]  WITH CHECK ADD FOREIGN KEY([ClientId])
REFERENCES [dbo].[Client] ([Id])
GO
ALTER TABLE [dbo].[ClientSpecialOffer]  WITH CHECK ADD FOREIGN KEY([OfferId])
REFERENCES [dbo].[SpecialOffer] ([Id])
GO
ALTER TABLE [dbo].[CustomerBillingInformation]  WITH CHECK ADD FOREIGN KEY([ClientID])
REFERENCES [dbo].[Client] ([Id])
GO
ALTER TABLE [dbo].[QuoteInformation]  WITH CHECK ADD FOREIGN KEY([ServiceTypeId])
REFERENCES [dbo].[CompanyServices] ([Id])
GO
ALTER TABLE [dbo].[SpecialOffer]  WITH CHECK ADD FOREIGN KEY([OfferRateId])
REFERENCES [dbo].[OfferRate] ([Id])
GO
/****** Object:  StoredProcedure [dbo].[GetIdFromTables]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetIdFromTables]
    @srchType VARCHAR(50),
	@srchValue1  NVARCHAR(50),
	@srchValue2  NVARCHAR(50),
	@srchValue3  NVARCHAR(50),
	@srchValue4  NVARCHAR(50),
	@srchStart	DATETIME,
	@srchEnd	DATETIME


AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id INT;
	DECLARE @isNumber INT;
	DECLARE @numValue	INT

    -- Initialize @id to NULL
    SET @id = NULL;

    -- Use a SWITCH statement to select the ID from different tables based on @srchType

	IF ISNUMERIC(@srchValue1) = 1
	PRINT 'BEFORE IF STATEMENT'
IF @srchType IS NOT NULL AND  @srchValue1 IS NOT NULL
OR @srchValue2 IS NOT NULL OR @srchValue3 IS NOT NULL 
OR @srchValue4 IS NOT NULL OR @srchStart IS NOT NULL OR @srchEnd IS NOT NULL
	
	BEGIN
		BEGIN
		BEGIN TRY
			SELECT @id =
				CASE @srchType
					WHEN 'C'
					THEN (SELECT DISTINCT TOP 1 Id FROM cle_client.dbo.Client WHERE FirstName = @srchValue1 AND LastName =@srchValue2 AND CompanyName = @srchValue3 ) -- Add your condition
					WHEN 'ICC'
					THEN (SELECT DISTINCT TOP 1 Id FROM cle_client.dbo.ClientContact WHERE EmailAddress = @srchValue1) -- Add your condition
					WHEN 'ICA'
					THEN (SELECT DISTINCT TOP 1 Id FROM cle_client.dbo.CustomerAddress WHERE AddressLine1 = @srchValue1 and City = @srchValue2 AND State = @srchValue3 AND ZipCOde = @srchValue4) -- Add your condition
					WHEN 'C' 
					THEN (SELECT DISTINCT TOP 1 Id from cle_client.dbo.Client where FirstName = @srchValue1 AND LastName = @srchValue2 AND CompanyName = @srchValue3)
					WHEN 'CQ'
					THEN (SELECT DISTINCT TOP 1 Id from cle_client.dbo.QuoteInformation WHERE EmailAddress = @srchValue1 AND FirstName = @srchValue2 and LastName = @srchValue3 AND CompanyName = @srchValue4
					OR  FirstName = @srchValue2 AND LastName = @srchValue3 AND CompanyName = @srchValue4)
					WHEN 'CA'
					THEN (SELECT DISTINCT TOP 1 Id from cle_client.dbo.ClientAssistRequest WHERE EmailAddress = @srchValue1 AND FirstName = @srchValue2 and LastName = @srchValue3 AND CompanyName = @srchValue4
					OR  FirstName = @srchValue2 AND LastName = @srchValue3 AND CompanyName = @srchValue4)
					
					END
			END TRY
			BEGIN CATCH
			    PRINT 'An error occurred: ' + ERROR_MESSAGE();
			END CATCH
		END
	END
    -- Return the selected ID
	PRINT CONVERT(INT,@Id)
		SELECT @id AS SelectedID;
END

SET NOCOUNT OFF;
SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[InsertWebsiteLog]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[InsertWebsiteLog]
    @Timestamp DATETIME,
    @IPAddress VARCHAR(50),
    @RequestURL VARCHAR(255),
    @HttpMethod VARCHAR(10),
    @StatusCode INT,
    @ResponseSize BIGINT,
    @UserAgent VARCHAR(255),
    @Referer VARCHAR(255),
    @ErrorMsg VARCHAR(255) = NULL  -- Optional parameter for error message
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [CLE_Admin].[dbo].[WebsiteLog] (Timestamp, IPAddress, RequestURL, HttpMethod, StatusCode, ResponseSize, UserAgent, Referer, ErrorMsg)
    VALUES (@Timestamp, @IPAddress, @RequestURL, @HttpMethod, @StatusCode, @ResponseSize, @UserAgent, @Referer, @ErrorMsg);
END
GO
/****** Object:  StoredProcedure [dbo].[upsGetClientProfileById]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[upsGetClientProfileById]
	@clientid	INT
AS	
BEGIN
    SET NOCOUNT ON;
	SELECT (
		SELECT 
		[FirstName] as 'FirstName',
		[LastName] as 'LastName',
		[CompanyName] as 'CompanyName',
		[EmailAddress] as 'EmailAddress',
		[BusinessPhone] as 'BusinessPhone',
		[PersonalPhone] as 'PersonelPhone',
		[CellPhone] as 'CellPhone',
		[ContactPreference] as 'ContactPreference',
		[Extension] as 'Extension',
		[AddressLine1] as 'AddressLine1',
		[AddressLine2] as 'AddressLine2',
		[City]as 'City',
		[State]as 'State',
		[ZipCode] as 'ZipCode',
		[CountryName] as 'CountryName'
		FROM [CLE_Client].[dbo].[Client] a(NOLOCK)
		INNER JOIN [CLE_Client].[dbo].[ClientContact] b(NOLOCK) on a.ClientContactId = b.Id
		INNER jOIN [CLE_Client].[dbo].[CustomerAddress] c(NOLOCK) on a.CustomerAddressId = c.Id
		INNER JOIN [CLE_Client].[dbo].[CountryCodes] d(NOLOCK) on c.CountryCodeId = d.Id
		WHERE a.Id = @clientid
    FOR JSON PATH) AS 'ClientProfile'
END;
GO
/****** Object:  StoredProcedure [dbo].[uspGetAllQouteDataByClientIdInJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspGetAllQouteDataByClientIdInJSON]
	@clientid	INT
AS	
BEGIN
    SET NOCOUNT ON;
	SELECT (
    SELECT 
        QI.Id AS QuoteId,
        QI.ClientID,
        CS.ServiceName,
        QI.ProjectDescription,
        QI.EstimatedCost,
        QI.EstimatedTimeline,
        QI.AdditionalNotes,
        QI.DateCreated AS QuoteDateCreated,
        QI.DateUpdated AS QuoteDateUpdated,
        C.Id AS ClientId,
        C.FirstName AS ClientFirstName,
        C.LastName AS ClientLastName,
        C.CompanyName AS ClientCompanyName,
        C.ClientContactId,
        C.ClientAddrID,
        C.DateCreated AS ClientDateCreated,
        C.DateUpdated AS ClientDateUpdated
    FROM QuoteInformation QI(nolock)
    INNER JOIN Client C(nolock) ON QI.ClientID = C.Id
	INNER JOIN CompanyServices CS(nolock) ON QI.ServiceTypeId = CS.Id
	WHERE  QI.ClientID = @clientid

    FOR JSON PATH) AS 'QouteByuClient'
END;
GO
/****** Object:  StoredProcedure [dbo].[uspGetBillingInvoiceAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Billing Invoice GET sp
CREATE PROCEDURE [dbo].[uspGetBillingInvoiceAsJSON]
AS
BEGIN
	SELECT(
    SELECT InvoiceID,InvoiceNum, ClientID, InvoiceDate, DueDate, Amount, CurBalance, AdjustBalance, StatusId, PaymentDate, Notes, DateCreated, DateUpdated
    FROM BillingInvoice(NOLOCK)
    FOR JSON PATH) AS 'BillInv'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetBillingInvoiceByClientID]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspGetBillingInvoiceByClientID]
    @ClientID INT
AS
BEGIN
    SET NOCOUNT ON;

	SELECT(
    SELECT 
		InvoiceId,
		InvoiceNum,
        InvoiceDate,
        DueDate,
        Amount,
        CurBalance,
        AdjustBalance,
        StatusName,
        PaymentDate,
        Notes 
		from BillingInvoice e(nolock)
		INNER JOIN PaymentStatus f(nolock) on e.StatusId = f.StatusID
		WHERE Clientid = @ClientID
 
        --ClientID = @ClientID
    FOR JSON PATH) AS 'BillInvClientId'
END;
GO
/****** Object:  StoredProcedure [dbo].[uspGetBillingInvoiceByDateRangeAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Billing Invoice By date GET sp
CREATE PROCEDURE [dbo].[uspGetBillingInvoiceByDateRangeAsJSON]
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
SELECT(
    SELECT
        InvoiceID,
		InvoiceNum,
        ClientID,
        InvoiceDate,
        DueDate,
        Amount,
        CurBalance,
        AdjustBalance,
        StatusId,
        PaymentDate,
        Notes,
        DateCreated,
        DateUpdated
    FROM
        BillingInvoice(nolock)
    WHERE
        InvoiceDate BETWEEN @StartDate AND @EndDate
    FOR JSON PATH) AS 'BillInvByDate'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetBillingInvoiceByInvoiceId]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspGetBillingInvoiceByInvoiceId]
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
	SELECT (
    SELECT 
        InvoiceID,
		InvoiceNum,
        InvoiceDate,
        DueDate,
        Amount,
        CurBalance,
        AdjustBalance,
        StatusId,
        PaymentDate,
        Notes
    FROM 
        BillingInvoice(nolock)
    WHERE 
        InvoiceID = @id
    FOR JSON PATH) AS 'BillInvByInvId'
END;
GO
/****** Object:  StoredProcedure [dbo].[uspGetBillingInvoicesByPaymentStatus]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspGetBillingInvoicesByPaymentStatus]
    @StatusName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
	SELECT(
    SELECT 
        BI.InvoiceID,
		BI.InvoiceNum,
        BI.ClientID,
        BI.InvoiceDate,
        BI.DueDate,
        BI.Amount,
        BI.CurBalance,
        BI.AdjustBalance,
        BI.StatusId,
        BI.PaymentDate,
        BI.Notes,
        BI.DateCreated AS InvoiceDateCreated,
        BI.DateUpdated AS InvoiceDateUpdated,
        PS.StatusName AS PaymentStatus
    FROM 
        BillingInvoice BI(nolock)
    INNER JOIN 
        PaymentStatus PS(nolock) ON BI.StatusId = PS.StatusID
    WHERE 
        PS.StatusName = @StatusName
    FOR JSON PATH) AS 'BillInvByPayStatus'
END

    SET NOCOUNT ON;
GO
/****** Object:  StoredProcedure [dbo].[uspGetBillingInvoicesByPaymentStatusID]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspGetBillingInvoicesByPaymentStatusID]
    @StatusID INT
AS
BEGIN
    SET NOCOUNT ON;
	SELECT (
    SELECT 
        BI.InvoiceID,
		BI.InvoiceNum,
        BI.ClientID,
        BI.InvoiceDate,
        BI.DueDate,
        BI.Amount,
        BI.CurBalance,
        BI.AdjustBalance,
        BI.StatusId,
        BI.PaymentDate,
        BI.Notes,
        BI.DateCreated AS InvoiceDateCreated,
        BI.DateUpdated AS InvoiceDateUpdated,
        PS.StatusID AS PaymentStatusID,
        PS.StatusName AS PaymentStatus
    FROM 
        BillingInvoice BI(nolock)
    INNER JOIN 
        PaymentStatus PS(nolock) ON BI.StatusId = PS.StatusID
    WHERE 
        PS.StatusID = @StatusID
    FOR JSON PATH) AS 'BillInvByStatusId'
END

    SET NOCOUNT ON;
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientBillingInfoById]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspGetClientBillingInfoById]
    @clientId INT
AS
BEGIN
    SET NOCOUNT ON;
	SELECT(
		SELECT 
			a.Id,
			b.FirstName,
			b.LastName,
			b.CompanyName,
			ClientID,
			BillingAddress,
			BillingCity,
			BillingState,
			BillingZipCode,
			CreditCardNumber,
			ExpiryDate,
			CVV,
			BillingDate
		FROM 
			[CLE_Client].[dbo].[CustomerBillingInformation] a(nolock)
			INNER JOIN [CLE_Client].[dbo].[Client] b(nolock) on b.Id = a.ClientID
		WHERE 
			ClientID = @ClientId
		FOR JSON PATH) AS 'BillingInfo'
	END
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientByIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client GET sp
CREATE PROCEDURE [dbo].[uspGetClientByIdAsJSON]
   @ClientID INT
AS
BEGIN
SELECT(
    SELECT Id, FirstName, LastName, CompanyName, ClientContactId, CustomerAddressId, DateCreated, DateUpdated
    FROM Client(nolock)
	WHERE Id = @ClientID
    FOR JSON PATH) AS 'ClientById'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientContactAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Contact GET sp
CREATE PROCEDURE [dbo].[uspGetClientContactAsJSON]
AS
BEGIN
SELECT(
    SELECT Id, EmailAddress, BusinessPhone, PersonalPhone, CellPhone, ContactPreference, Extension, CreatedDate, UpdatedDate
    FROM ClientContact(nolock)
    FOR JSON PATH) AS 'ClientContact'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientContactByEmailAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Contact GET sp
CREATE PROCEDURE [dbo].[uspGetClientContactByEmailAsJSON]
	@email	VARCHAR(255)
AS
BEGIN
SELECT(
    SELECT Id, EmailAddress, BusinessPhone, PersonalPhone, CellPhone, ContactPreference, Extension, CreatedDate, UpdatedDate
    FROM ClientContact(nolock)
	WHERE EmailAddress = @email
    FOR JSON PATH) AS 'ClientConByEmail'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientContactByIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Contact GET sp
CREATE PROCEDURE [dbo].[uspGetClientContactByIdAsJSON]
	@id	INT
AS
BEGIN
SELECT(
    SELECT Id, EmailAddress, BusinessPhone, PersonalPhone, CellPhone, ContactPreference, Extension, CreatedDate, UpdatedDate
    FROM ClientContact(nolock)
	WHERE Id = @id
    FOR JSON PATH) AS 'ClientConById'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientDataByClientId]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspGetClientDataByClientId]
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
	SELECT(
    SELECT 
        C.Id AS ClientId,
        C.FirstName,
        C.LastName,
        C.CompanyName,
        CA.Id AS AddressId,
        CA.AddressLine1,
        CA.AddressLine2,
        CA.City,
        CA.State,
        CA.ZipCode,
        CA.CountryCodeId,
        CC.Id AS ContactId,
        CC.EmailAddress,
        CC.BusinessPhone,
        CC.PersonalPhone,
        CC.CellPhone,
        CC.ContactPreference,
        CC.Extension
    FROM 
        Client C(nolock)
    INNER JOIN 
        CustomerAddress CA(nolock) ON C.ClientAddrID = CA.Id
    INNER JOIN 
        ClientContact CC(nolock) ON C.ClientContactId = CC.Id
    WHERE 
        C.Id = @ClientId
    FOR JSON PATH) AS 'ClientDataById'
END

SET NOCOUNT ON;
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientIdByEmail]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login GET sp
CREATE PROCEDURE [dbo].[uspGetClientIdByEmail]
	@email varchar(255)

AS
BEGIN
--SELECT (
--SELECT( DISITNCT
    SELECT DISTINCT ClientId
    FROM ClientLogin(nolock)
	WHERE userEmail = @email AND ClientId IS NOT NULL
    --FOR JSON PATH) AS 'ClientId'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientLogByEmailAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login GET sp
CREATE PROCEDURE [dbo].[uspGetClientLogByEmailAsJSON]
	@email varchar(255)

AS
BEGIN
SELECT(
    SELECT Id, ClientId, userEmail, userPassword, DateCreated, DateUpdated
    FROM ClientLogin(nolock)
	WHERE userEmail = @email
    FOR JSON PATH) AS 'ClientLOgByEmail'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientLogByIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login GET sp
CREATE PROCEDURE [dbo].[uspGetClientLogByIdAsJSON]
	@Id INT

AS
BEGIN
SELECT(
    SELECT Id, ClientId, userEmail, userPassword, DateCreated, DateUpdated
    FROM ClientLogin(nolock)
	WHERE Id = @Id
    FOR JSON PATH) AS 'ClientLogById'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientLoginAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login GET sp
CREATE PROCEDURE [dbo].[uspGetClientLoginAsJSON]
AS
BEGIN
SELECT(
    SELECT Id, ClientId, userEmail, userPassword, DateCreated, DateUpdated
    FROM ClientLogin(nolock)
    FOR JSON PATH) AS 'ClientLog'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientLoginByClientIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login GET sp
CREATE PROCEDURE [dbo].[uspGetClientLoginByClientIdAsJSON]
	@clientid INT
AS
BEGIN
    SELECT Id, ClientId, userEmail, userPassword, DateCreated, DateUpdated
    FROM ClientLogin(nolock)
	WHERE ClientId = @clientid
    FOR JSON AUTO;
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientPasswordByUserName]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login GET sp
CREATE PROCEDURE [dbo].[uspGetClientPasswordByUserName]
	@username varchar(255)

AS
BEGIN
SELECT(
    SELECT DISTINCT TOP 1  userPassword
    FROM ClientLogin(nolock)
	WHERE userEmail = @username
    FOR JSON PATH) AS 'ClientPass'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientsAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client GET sp
CREATE PROCEDURE [dbo].[uspGetClientsAsJSON]
AS
BEGIN
    SELECT (select Id AS [Client.Id], FirstName AS [Client.FirstName], LastName AS [Client.Lastname], CompanyName AS [Client.CompanyName],
	ClientContactId AS [Client.ClientContactId], ClientAddrID AS [Client.ClientAddrID], DateCreated AS [Client.DateCreated]
	,DateUpdated AS [Client.DateUpdated]

    FROM Client(nolock)  
  FOR JSON PATH ) AS 'ClientData'
  --,  WITHOUT_ARRAY_WRAPPER;
  --ROOT('Client');
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientSpecialOfferAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Special Offer GET sp
CREATE PROCEDURE [dbo].[uspGetClientSpecialOfferAsJSON]
AS
BEGIN
SELECT(
    SELECT Id, ClientId, OfferId, DateCreated, DateUpdated
    FROM ClientSpecialOffer(nolock)
    FOR JSON PATH) AS 'ClientSpecOffer'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientSpecialOfferByClientIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Special Offer GET sp
CREATE PROCEDURE [dbo].[uspGetClientSpecialOfferByClientIdAsJSON]
	@clientid	INT
AS
BEGIN
SELECT(
    SELECT Id, ClientId, OfferId, DateCreated, DateUpdated
    FROM ClientSpecialOffer
	WHERE Clientid = @clientid
    FOR JSON PATH) AS 'ClientSpecByClientId'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientSpecialOfferByDateRangeAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Special Offer by Date GET sp
CREATE PROCEDURE [dbo].[uspGetClientSpecialOfferByDateRangeAsJSON]
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
SELECT(
    SELECT
        CS.Id,
        ClientId,
        OfferId,
        CS.DateCreated,
        CS.DateUpdated
    FROM
        ClientSpecialOffer CS(nolock)
		INNER JOIN SpecialOffer sp(nolock) ON CS.OfferId = SP.Id
    WHERE
        Sp.OfferStartDate >=   @StartDate AND sp.OfferEndDate <= @EndDate
    FOR JSON PATH) AS 'ClentSpecByDate'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientSpecialOfferByIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Special Offer GET sp
CREATE PROCEDURE [dbo].[uspGetClientSpecialOfferByIdAsJSON]
	@id	INT
AS
BEGIN
SELECT(
    SELECT Id, ClientId, OfferId, DateCreated, DateUpdated
    FROM ClientSpecialOffer
	WHERE Id  = @id
    FOR JSON PATH) AS 'ClientSpecOfById'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetClientSpecialOfferByOfferIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Special Offer GET sp
CREATE PROCEDURE [dbo].[uspGetClientSpecialOfferByOfferIdAsJSON]
	@offerid	INT
AS
BEGIN
SELECT(
    SELECT Id, ClientId, OfferId, DateCreated, DateUpdated
    FROM ClientSpecialOffer
	WHERE OfferId  = @offerid
    FOR JSON PATH) AS 'ClientSpecByOfferId'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetCompanyServicesAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Company Services GET sp
CREATE PROCEDURE [dbo].[uspGetCompanyServicesAsJSON]
AS
BEGIN
SELECT(
    SELECT Id, ServiceName, DateCreated, DateUpdated
    FROM CompanyServices(nolock)
    FOR JSON PATH) AS 'CompServices'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetCountryCodesAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Country Codes GET sp
CREATE PROCEDURE [dbo].[uspGetCountryCodesAsJSON]
AS
BEGIN
SELECT(
    SELECT DISTINCT Id, CountryCode, CountryName, DateCreated, DateUpdated
    FROM CountryCodes(nolock) ORDER BY CountryName
    FOR JSON PATH) AS 'CountryCOdes'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetCustomerAddressAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Customer Address GET sp
CREATE PROCEDURE [dbo].[uspGetCustomerAddressAsJSON]
AS
BEGIN
SELECT(
    SELECT Id, AddressLine1, AddressLine2, City, State, ZipCode, CountryCodeId, DateCreated, DateUpdated
    FROM CustomerAddress(nolock)
    FOR JSON PATH) AS 'CustAddr'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetCustomerAddressByIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Customer Address GET sp
CREATE PROCEDURE [dbo].[uspGetCustomerAddressByIdAsJSON]
	@id		INT
AS
BEGIN
SELECT(
    SELECT Id, AddressLine1, AddressLine2, City, State, ZipCode, CountryCodeId, DateCreated, DateUpdated
    FROM CustomerAddress(nolock)
	WHERE Id = @id
    FOR JSON PATH) AS 'CustAddr'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetCustomerBillingInfoByDateRangeAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Customer Billing Info GET sp
CREATE PROCEDURE [dbo].[uspGetCustomerBillingInfoByDateRangeAsJSON]
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
SELECT(
    SELECT
        Id,
        ClientID,
        BillingAddress,
        BillingCity,
        BillingState,
        BillingZipCode,
        CreditCardNumber,
        ExpiryDate,
        CVV,
        BillingDate
    FROM
        CustomerBillingInformation(nolock)
    WHERE
        BillingDate BETWEEN @StartDate AND @EndDate
    FOR JSON PATH) AS 'BillingInfoByDate'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetCustomerBillingInformationAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Customer Billing INfo GET sp
CREATE PROCEDURE [dbo].[uspGetCustomerBillingInformationAsJSON]
AS
BEGIN
SELECT(
    SELECT Id, ClientID, BillingAddress, BillingCity, BillingState, BillingZipCode, CreditCardNumber, ExpiryDate, CVV, BillingDate 
    FROM CustomerBillingInformation(nolock)
    FOR JSON PATH) AS 'BillingInfo'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetOfferRateAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Offer Rate GET sp
CREATE PROCEDURE [dbo].[uspGetOfferRateAsJSON]
AS
BEGIN
SELECT(
    SELECT Id, Rate, DateCreated, DateUpdated
    FROM OfferRate(nolock)
    FOR JSON PATH) AS 'OfferRates'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetPaymentStatusAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Payment Status GET sp
CREATE PROCEDURE [dbo].[uspGetPaymentStatusAsJSON]
AS
BEGIN
SELECT(
    SELECT StatusID, StatusName
    FROM PaymentStatus(nolock)
    FOR JSON PATH) AS 'PaymentStatuses'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetQuoteIdByEmailAndConmpany]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Qoute Info GET sp
CREATE PROCEDURE [dbo].[uspGetQuoteIdByEmailAndConmpany]
	@email varchar(100),
	@compname varchar(100)
AS
BEGIN
SELECT(
    SELECT Id FROM QuoteInformation(nolock)
	WHERE EmailAddress = @email and CompanyName = @compname
	AND Status in ('New''Pending','Accepted','InProgress','OnHold','Completed','UnderReview','AwaitingApproval')
    FOR JSON PATH) AS 'QouteInfo'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetQuoteInformationAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Qoute Info GET sp
CREATE PROCEDURE [dbo].[uspGetQuoteInformationAsJSON]
AS
BEGIN
SELECT(
    SELECT Id,
        ServiceTypeId,
        ProjectDescription,
        EstimatedCost,
        EstimatedTimeline,
        AdditionalNotes,
        DateCreated,
        CompanyName,
        FirstName,
        LastName,
        EmailAddress,
        BusinessPhone,
        ContactPreference,
        Extension,
		Status   
		FROM QuoteInformation(nolock)
    FOR JSON PATH) AS 'QouteINfo'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetQuoteInformationByDateRangeAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Qoute Info GET sp
CREATE PROCEDURE [dbo].[uspGetQuoteInformationByDateRangeAsJSON]
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
SELECT(
    SELECT Id,
        ServiceTypeId,
        ProjectDescription,
        EstimatedCost,
        EstimatedTimeline,
        AdditionalNotes,
        DateCreated,
        CompanyName,
        FirstName,
        LastName,
        EmailAddress,
        BusinessPhone,
        ContactPreference,
        Extension,
		Status
    FROM
        QuoteInformation(nolock)
    WHERE
        DateCreated BETWEEN @StartDate AND @EndDate
    FOR JSON PATH) AS 'QouteInfoByDate'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetQuoteInformationByEmailAndConmpany]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Qoute Info GET sp
CREATE PROCEDURE [dbo].[uspGetQuoteInformationByEmailAndConmpany]
	@email varchar(100),
	@compname varchar(100)
AS
BEGIN
SELECT(
    SELECT Id,
        ServiceTypeId,
        ProjectDescription,
        EstimatedCost,
        EstimatedTimeline,
        AdditionalNotes,
        DateCreated,
        CompanyName,
        FirstName,
        LastName,
        EmailAddress,
        BusinessPhone,
        ContactPreference,
        Extension,
		Status
		FROM QuoteInformation(nolock)
	WHERE EmailAddress = @email and CompanyName = @compname
    FOR JSON PATH) AS 'QouteInfo'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetQuoteInformationByIdAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Qoute Info GET sp
CREATE PROCEDURE [dbo].[uspGetQuoteInformationByIdAsJSON]
	@id	INT
AS
BEGIN
SELECT(
    SELECT Id,
        ServiceTypeId,
        ProjectDescription,
        EstimatedCost,
        EstimatedTimeline,
        AdditionalNotes,
        DateCreated,
        CompanyName,
        FirstName,
        LastName,
        EmailAddress,
        BusinessPhone,
        ContactPreference,
        Extension,
		Status
		FROM QuoteInformation(nolock)
	WHERE Id = @id
    FOR JSON PATH) AS 'QouteINfo'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetSpecialOfferAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Special Offer GET sp
CREATE PROCEDURE [dbo].[uspGetSpecialOfferAsJSON]
AS
BEGIN
SELECT(
    SELECT Id, OfferName, OfferDetails, OfferRateId, OfferStartDate, OfferEndDate, DateCreated, DateUpdated
    FROM SpecialOffer(nolock)
    FOR JSON PATH) AS 'SpecOffer'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetSpecialOfferByDateRangeAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Special Offer By Date GET sp
CREATE PROCEDURE [dbo].[uspGetSpecialOfferByDateRangeAsJSON]
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
SELECT(
    SELECT
        Id,
        OfferName,
        OfferDetails,
        OfferRateId,
        OfferStartDate,
        OfferEndDate,
        DateCreated,
        DateUpdated
    FROM
        SpecialOffer(nolock)
    WHERE
        OfferStartDate >= @StartDate AND OfferEndDate <= @EndDate
    FOR JSON PATH) AS 'SpecOfferByDate'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspGetSpecialOffersByDate]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspGetSpecialOffersByDate]
    @Date DATE
AS
BEGIN
    SET NOCOUNT ON;

	SELECT(
    SELECT
        CSO.Id AS ClientSpecialOfferId,
        CSO.ClientId,
        CSO.OfferId,
        CSO.DateCreated AS ClientSpecialOfferDateCreated,
        CSO.DateUpdated AS ClientSpecialOfferDateUpdated,
        SO.Id AS SpecialOfferId,
        SO.OfferName,
        SO.OfferDetails,
        SO.OfferRateId,
        SO.OfferStartDate,
        SO.OfferEndDate,
        SO.DateCreated AS SpecialOfferDateCreated,
        SO.DateUpdated AS SpecialOfferDateUpdated
    FROM
        ClientSpecialOffer CSO(nolock)
    INNER JOIN
        SpecialOffer SO ON CSO.OfferId = SO.Id(nolock)
    WHERE
        SO.OfferStartDate >= @Date AND @Date <= SO.OfferEndDate
    FOR JSON PATH) AS 'SpecOffferByDate'
END
SET NOCOUNT OFF;
GO
/****** Object:  StoredProcedure [dbo].[uspInsertClientAndContactDetails]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspInsertClientAndContactDetails]
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @CompanyName NVARCHAR(100),
    @EmailAddress NVARCHAR(100),
    @BusinessPhone NVARCHAR(20),
    @PersonalPhone NVARCHAR(20),
    @CellPhone NVARCHAR(20),
    @ContactPreference NVARCHAR(50),
    @Extension NVARCHAR(10),
    @AddressLine1 NVARCHAR(100),
    @AddressLine2 NVARCHAR(100),
    @City NVARCHAR(50),
    @State NVARCHAR(50),
    @ZipCode NVARCHAR(20),
    @CountryCodeId INT,
	@ClientLogId	INT
AS
BEGIN
DECLARE @ContId	INT
DECLARE @AddrId	INT
DECLARE @InsertedCliendtId	INT
    SET NOCOUNT ON;
	    BEGIN TRY
			BEGIN TRANSACTION;
				-- Insert into ClientContact table
				INSERT INTO [CLE_Client].[dbo].[ClientContact] ( [EmailAddress], [BusinessPhone], [PersonalPhone], [CellPhone], [ContactPreference], [Extension], [CreatedDate])
				VALUES ( @EmailAddress, @BusinessPhone, @PersonalPhone, @CellPhone, @ContactPreference, @Extension, GETDATE());
				SELECT @ContId = SCOPE_IDENTITY() 

				-- Insert into CustomerAddress table
				INSERT INTO [CLE_Client].[dbo].[CustomerAddress] ( [AddressLine1], [AddressLine2], [City], [State], [ZipCode], [CountryCodeId], [DateCreated])
				VALUES (@AddressLine1, @AddressLine2, @City, @State, @ZipCode, @CountryCodeId, GETDATE());
				SELECT @AddrId = SCOPE_IDENTITY() 

				-- Insert into Client table
				INSERT INTO [CLE_Client].[dbo].[Client] ([FirstName], [LastName], [CompanyName], [ClientContactId],[CustomerAddressId], [DateCreated])
				VALUES (@FirstName, @LastName, @CompanyName, @ContId, @AddrId,GETDATE());
				SET @InsertedCliendtId = SCOPE_IDENTITY()
				--SELECT SCOPE_IDENTITY() AS 'Id'

				UPDATE [CLE_Client].[dbo].[ClientLogin]
				SET ClientId = @InsertedCliendtId
				WHERE Id = @ClientLogId
				SELECT SCOPE_IDENTITY() AS 'Id'


	        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        -- Error handling
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        -- Raise an error or log the error as needed
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END;
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoBillingInvoice]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Billing Invoice INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoBillingInvoice]
(
    @ClientID INT,
    @InvoiceDate DATE,
    @DueDate DATE,
    @Amount DECIMAL(18, 2),
    @CurBalance DECIMAL(18, 2),
    @AdjustBalance DECIMAL(18, 2),
    @StatusId INT,
    @PaymentDate DATE,
    @Notes TEXT
)
AS
BEGIN
	DECLARE @InvNum	int 
	SET @InvNum =  [dbo].[GenerateUniqueInvNumber](@ClientID)

    INSERT INTO BillingInvoice (ClientID, InvoiceDate, DueDate, Amount, CurBalance, AdjustBalance, StatusId, PaymentDate, Notes,InvoiceNum)
    VALUES (@ClientID, @InvoiceDate, @DueDate, @Amount, @CurBalance, @AdjustBalance, @StatusId, @PaymentDate, @Notes,@InvNum);
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoClient]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoClient]
(
    @FirstName VARCHAR(100),
    @LastName VARCHAR(100),
    @CompanyName VARCHAR(255),
    @ClientContactId INT,
    @CustomerAddressId INT,
	@DateCreated Date
)
AS
BEGIN
    INSERT INTO Client (FirstName, LastName, CompanyName, ClientContactId, CustomerAddressId,DateCreated)
    VALUES (@FirstName, @LastName, @CompanyName, @ClientContactId, @CustomerAddressId,@DateCreated);
	SELECT SCOPE_IDENTITY() AS 'ClientId'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoClientAssist]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Qoute INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoClientAssist]
(
      @CompanyName VARCHAR(100),
      @FirstName VARCHAR(50),
      @LastName	VARCHAR(50),
      @EmailAddress	VARCHAR(100),
      @BusinessPhone	VARCHAR(20),
      @Extension	VARCHAR(10),
      @Description	VARCHAR(max)
)
AS
BEGIN
 INSERT INTO [ClientAssistRequest] (
       [CompanyName]
      ,[FirstName]
      ,[LastName]
      ,[EmailAddress]
      ,[BusinessPhone]
      ,[Extension]
      ,[Description]
      ,[DateCreated]
    )
    VALUES (
      @CompanyName,
      @FirstName,
      @LastName,
      @EmailAddress,
      @BusinessPhone,
      @Extension,
      @Description,
      GETDATE()
    )
		SELECT SCOPE_IDENTITY() AS 'Id'

END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoClientContact]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Contact INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoClientContact]
(
    @EmailAddress VARCHAR(255),
    @BusinessPhone VARCHAR(20),
    @PersonalPhone VARCHAR(20),
    @CellPhone VARCHAR(20),
    @ContactPreference VARCHAR(50),
    @Extension VARCHAR(10),
	@CreatedDate Datetime
)
AS
BEGIN
    INSERT INTO ClientContact (EmailAddress, BusinessPhone, PersonalPhone, CellPhone, ContactPreference, Extension,CreatedDate)
    VALUES (@EmailAddress, @BusinessPhone, @PersonalPhone, @CellPhone, @ContactPreference, @Extension,@CreatedDate);
	SELECT SCOPE_IDENTITY() AS 'ContactId'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoClientLogin]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--ClientLogin INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoClientLogin]
(
    @username VARCHAR(255),
    @userpassword VARCHAR(255)
)
AS
BEGIN
    INSERT INTO ClientLogin ( userEmail, userPassword,[DateCreated])
    VALUES ( @username, @userpassword,getdate());
	SELECT SCOPE_IDENTITY() AS 'Id'

END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoClientSpecialOffer]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Special Offer INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoClientSpecialOffer]
(
    @ClientId INT,
    @OfferId INT
)
AS
BEGIN
    INSERT INTO ClientSpecialOffer (ClientId, OfferId)
    VALUES (@ClientId, @OfferId);
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoCompanyServices]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Company Services INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoCompanyServices]
(
    @ServiceName VARCHAR(255)
)
AS
BEGIN
    INSERT INTO CompanyServices (ServiceName)
    VALUES (@ServiceName);
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoCountryCodes]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Couintry Code INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoCountryCodes]
(
    @CountryCode VARCHAR(2),
    @CountryName VARCHAR(255)
)
AS
BEGIN
    INSERT INTO CountryCodes (CountryCode, CountryName)
    VALUES (@CountryCode, @CountryName);
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoCustomerAddress]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Address INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoCustomerAddress]
(
    @AddressLine1 VARCHAR(255),
    @AddressLine2 VARCHAR(255),
    @City VARCHAR(100),
    @State VARCHAR(100),
    @ZipCode VARCHAR(20),
    @CountryCodeId VARCHAR(3),
	@DateCreated Datetime
)
AS
BEGIN
    INSERT INTO CustomerAddress ( AddressLine1, AddressLine2, City, State, ZipCode, CountryCodeiD,[DateCreated])
    VALUES ( @AddressLine1, @AddressLine2, @City, @State, @ZipCode, @CountryCodeId,@DateCreated);
	SELECT SCOPE_IDENTITY() AS 'Address'
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoCustomerBillingInformation]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Customer Billing INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoCustomerBillingInformation]
(
    @ClientID INT,
    @BillingAddress VARCHAR(255),
    @BillingCity VARCHAR(100),
    @BillingState VARCHAR(100),
    @BillingZipCode VARCHAR(20),
    @CreditCardNumber VARCHAR(20),
    @ExpiryDate DATE,
    @CVV VARCHAR(10),
    @BillingDate DATETIME
)
AS
BEGIN
    INSERT INTO CustomerBillingInformation (ClientID, BillingAddress, BillingCity, BillingState, BillingZipCode, CreditCardNumber, ExpiryDate, CVV, BillingDate)
    VALUES (@ClientID, @BillingAddress, @BillingCity, @BillingState, @BillingZipCode, @CreditCardNumber, @ExpiryDate, @CVV, @BillingDate);
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoOfferRate]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Offer Rate INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoOfferRate]
(
    @Rate VARCHAR(50)
)
AS
BEGIN
    INSERT INTO OfferRate (Rate)
    VALUES (@Rate);
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoPaymentStatus]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Payment Status INSERT	sp
CREATE PROCEDURE [dbo].[uspInsertIntoPaymentStatus]
(
    @StatusName VARCHAR(50)
)
AS
BEGIN
    INSERT INTO PaymentStatus (StatusName)
    VALUES (@StatusName);
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoQuoteInformation]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Qoute INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoQuoteInformation]
(
 @ServiceTypeId INT,
    @ProjectDescription NVARCHAR(MAX),
    @EstimatedCost DECIMAL(18,2),
    @EstimatedTimeline NVARCHAR(100),
    @AdditionalNotes NVARCHAR(MAX),
    @DateCreated DATETIME,
    @CompanyName NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @EmailAddress NVARCHAR(255),
    @BusinessPhone NVARCHAR(20),
    @ContactPreference NVARCHAR(50),
    @Extension NVARCHAR(10)
)
AS
BEGIN

	IF EXISTS(SELECT TOP 1 Id FROM QuoteInformation WHERE
	ServiceTypeId = @ServiceTypeId AND CONVERT(NVARCHAR(MAX), ProjectDescription)  = @ProjectDescription
	AND CompanyName = @CompanyName AND FirstName = @FirstName AND LastName = @LastName
	AND EmailAddress = @EmailAddress)
		BEGIN
			SELECT 0 AS 'Id'
		END
	ELSE 
		BEGIN
		PRINT ('INSERTING')
		 INSERT INTO [QuoteInformation] (
				[ServiceTypeId],
				[ProjectDescription],
				[EstimatedCost],
				[EstimatedTimeline],
				[AdditionalNotes],
				[DateCreated],
				[CompanyName],
				[FirstName],
				[LastName],
				[EmailAddress],
				[BusinessPhone],
				[ContactPreference],
				[Extension]
			)
			VALUES (
				@ServiceTypeId,
				@ProjectDescription,
				@EstimatedCost,
				@EstimatedTimeline,
				@AdditionalNotes,
				@DateCreated,
				@CompanyName,
				@FirstName,
				@LastName,
				@EmailAddress,
				@BusinessPhone,
				@ContactPreference,
				@Extension
			)
				SELECT SCOPE_IDENTITY() AS 'Id'
		END
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspInsertIntoSpecialOffer]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Special OFfer INSERT sp
CREATE PROCEDURE [dbo].[uspInsertIntoSpecialOffer]
(
    @OfferName VARCHAR(255),
    @OfferDetails TEXT,
    @OfferRateId INT,
    @OfferStartDate DATE,
    @OfferEndDate DATE
)
AS
BEGIN
    INSERT INTO SpecialOffer (OfferName, OfferDetails, OfferRateId, OfferStartDate, OfferEndDate)
    VALUES (@OfferName, @OfferDetails, @OfferRateId, @OfferStartDate, @OfferEndDate);
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspUpdateBillingInvoice]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Billing Invoice UPDATE sp
CREATE PROCEDURE [dbo].[uspUpdateBillingInvoice]
    @InvoiceID INT,
    @ClientID INT,
    @InvoiceDate DATE,
    @DueDate DATE,
    @Amount DECIMAL(18, 2),
    @CurBalance DECIMAL(18, 2),
    @AdjustBalance DECIMAL(18, 2),
    @StatusId INT,
    @PaymentDate DATE,
    @Notes TEXT,
    @Result NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Update data in BillingInvoice table
    UPDATE BillingInvoice
    SET ClientID = @ClientID,
        InvoiceDate = @InvoiceDate,
        DueDate = @DueDate,
        Amount = @Amount,
        CurBalance = @CurBalance,
        AdjustBalance = @AdjustBalance,
        StatusId = @StatusId,
        PaymentDate = @PaymentDate,
        Notes = @Notes,
        DateUpdated = GETDATE()
    WHERE InvoiceID = @InvoiceID;

    -- Check if any row was updated
    IF @@ROWCOUNT > 0
    BEGIN
        -- Set the result JSON object for success
        SET @Result = '{"message": "Billing invoice updated successfully."}';
    END
    ELSE
    BEGIN
        -- Set the result JSON object for failure
        SET @Result = '{"error": "No records were updated."}';
    END
END
GO
/****** Object:  StoredProcedure [dbo].[uspUpdateClientLoginAsJSON]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login UPDATE sp
CREATE PROCEDURE [dbo].[uspUpdateClientLoginAsJSON]
    @ClientId INT,
    @NewUserEmail VARCHAR(255),
    @NewUserPassword VARCHAR(255)
AS
BEGIN
    -- Declare variable to store updated JSON data
    DECLARE @JSONData NVARCHAR(MAX);

    -- Update the ClientLogin table
    UPDATE ClientLogin
    SET userEmail = @NewUserEmail,
        userPassword = @NewUserPassword,
        DateUpdated = GETDATE()
    WHERE ClientId = @ClientId;

    -- Select the updated data as JSON
    --SELECT
    --    Id,
    --    ClientId,
    --    userEmail,
    --    userPassword,
    --    DateCreated,
    --    DateUpdated
    --INTO @JSONData
    --FROM ClientLogin
    --WHERE ClientId = @ClientId
    --FOR JSON PATH, ROOT('ClientLoginData');

    ---- Return the JSON data
    --SELECT @JSONData AS ClientLoginData;
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspUpdateClientLoginPassByEmail]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login UPDATE sp
CREATE PROCEDURE [dbo].[uspUpdateClientLoginPassByEmail]
    @UserEmail VARCHAR(255),
    @NewUserPassword VARCHAR(255)
AS
BEGIN
	BEGIN TRY
	DECLARE @UpdatedRecords TABLE (ID INT);

		UPDATE [CLE_Client].[dbo].ClientLogin
		SET userPassword = @NewUserPassword,
			DateUpdated = GETDATE()
			OUTPUT inserted.Id INTO @UpdatedRecords(ID)
			WHERE userEmail = @UserEmail

		SELECT * FROM @UpdatedRecords;
	 END TRY
	 BEGIN CATCH
	    PRINT 'An error occurred: ' + ERROR_MESSAGE();
	 END CATCH
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspUpdateCustomerBillingInformation]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Billing Info UPDATE SP
CREATE PROCEDURE [dbo].[uspUpdateCustomerBillingInformation]
    @Id INT,
    @ClientID INT,
    @BillingAddress VARCHAR(255),
    @BillingCity VARCHAR(100),
    @BillingState VARCHAR(100),
    @BillingZipCode VARCHAR(20),
    @CreditCardNumber VARCHAR(20),
    @ExpiryDate DATE,
    @CVV VARCHAR(10),
    @BillingDate DATETIME,
    @Result NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Update data in CustomerBillingInformation table
    UPDATE CustomerBillingInformation
    SET ClientID = @ClientID,
        BillingAddress = @BillingAddress,
        BillingCity = @BillingCity,
        BillingState = @BillingState,
        BillingZipCode = @BillingZipCode,
        CreditCardNumber = @CreditCardNumber,
        ExpiryDate = @ExpiryDate,
        CVV = @CVV,
        BillingDate = @BillingDate
    WHERE Id = @Id;

    -- Check if any row was updated
    IF @@ROWCOUNT > 0
    BEGIN
        -- Set the result JSON object for success
        SET @Result = '{"message": "Customer billing information updated successfully."}';
    END
    ELSE
    BEGIN
        -- Set the result JSON object for failure
        SET @Result = '{"error": "No records were updated."}';
    END
END

SET ANSI_NULLS ON
GO
/****** Object:  StoredProcedure [dbo].[uspUpdateQouteData]    Script Date: 7/18/2024 3:01:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Client Login UPDATE sp
Create PROCEDURE [dbo].[uspUpdateQouteData]
    @ServiceTypeId INT,
    @ProjectDescription NVARCHAR(MAX),
    @EstimatedCost DECIMAL(18, 2),
    @EstimatedTimeline INT,
    @AdditionalNotes NVARCHAR(MAX),
    @CompanyName NVARCHAR(255),
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE QuoteInformation
    SET 
        ServiceTypeId = @ServiceTypeId,
        ProjectDescription = @ProjectDescription,
        EstimatedCost = @EstimatedCost,
        EstimatedTimeline = @EstimatedTimeline,
        AdditionalNotes = @AdditionalNotes,
        DateUpdated = GETDATE(),
        CompanyName = @CompanyName
    WHERE
        Id = @Id;
END

SET ANSI_NULLS ON
GO
USE [master]
GO
ALTER DATABASE [CLE_Client] SET  READ_WRITE 
GO
