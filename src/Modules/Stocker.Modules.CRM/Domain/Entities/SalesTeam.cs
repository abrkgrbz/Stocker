using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Satış ekibi entity'si - Satış takımı yönetimi
/// Sales Team entity - Sales team management
/// </summary>
public class SalesTeam : TenantEntity
{
    private readonly List<SalesTeamMember> _members = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Takım adı / Team name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Takım kodu / Team code
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    #endregion

    #region Yönetici Bilgileri (Manager Information)

    /// <summary>
    /// Takım lideri kullanıcı ID / Team leader user ID
    /// </summary>
    public int? TeamLeaderId { get; private set; }

    /// <summary>
    /// Takım lideri adı / Team leader name
    /// </summary>
    public string? TeamLeaderName { get; private set; }

    /// <summary>
    /// Üst takım ID / Parent team ID
    /// </summary>
    public Guid? ParentTeamId { get; private set; }

    #endregion

    #region Hedef Bilgileri (Target Information)

    /// <summary>
    /// Satış hedefi / Sales target
    /// </summary>
    public decimal? SalesTarget { get; private set; }

    /// <summary>
    /// Hedef periyodu / Target period
    /// </summary>
    public string? TargetPeriod { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    #region Bölge Bilgileri (Territory Information)

    /// <summary>
    /// Bölge ID / Territory ID
    /// </summary>
    public Guid? TerritoryId { get; private set; }

    /// <summary>
    /// Bölge adları / Territory names
    /// </summary>
    public string? TerritoryNames { get; private set; }

    #endregion

    #region İletişim Bilgileri (Communication)

    /// <summary>
    /// Takım e-postası / Team email
    /// </summary>
    public string? TeamEmail { get; private set; }

    /// <summary>
    /// Slack/Teams kanalı / Slack/Teams channel
    /// </summary>
    public string? CommunicationChannel { get; private set; }

    #endregion

    #region Zaman Damgaları (Timestamps)

    /// <summary>
    /// Oluşturulma tarihi / Created date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Güncellenme tarihi / Updated date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    // Navigation
    public virtual SalesTeam? ParentTeam { get; private set; }
    public virtual Territory? Territory { get; private set; }
    public IReadOnlyList<SalesTeamMember> Members => _members.AsReadOnly();

    protected SalesTeam() : base() { }

    public SalesTeam(
        Guid tenantId,
        string name,
        string code) : base(Guid.NewGuid(), tenantId)
    {
        Name = name;
        Code = code;
        IsActive = true;
        Currency = "TRY";
        CreatedAt = DateTime.UtcNow;
    }

    public SalesTeamMember AddMember(int userId, string? userName = null, SalesTeamRole role = SalesTeamRole.Member)
    {
        if (_members.Any(m => m.UserId == userId && m.IsActive))
            throw new InvalidOperationException("Bu kullanıcı zaten takım üyesi.");

        var member = new SalesTeamMember(Id, userId, userName, role);
        _members.Add(member);
        return member;
    }

    public void RemoveMember(int userId)
    {
        var member = _members.FirstOrDefault(m => m.UserId == userId && m.IsActive);
        if (member != null)
            member.Deactivate();
    }

    public void SetTeamLeader(int userId, string? name = null)
    {
        TeamLeaderId = userId;
        TeamLeaderName = name;

        // Also add as member with leader role if not already
        var existingMember = _members.FirstOrDefault(m => m.UserId == userId && m.IsActive);
        if (existingMember != null)
        {
            existingMember.SetRole(SalesTeamRole.Leader);
        }
        else
        {
            AddMember(userId, name, SalesTeamRole.Leader);
        }
    }

    /// <summary>
    /// Set only team leader name (without user ID)
    /// Used when no user system integration is needed
    /// </summary>
    public void SetTeamLeaderName(string name)
    {
        TeamLeaderName = name;
    }

    public void SetSalesTarget(decimal target, string period)
    {
        SalesTarget = target;
        TargetPeriod = period;
    }

    public void SetTerritory(Guid territoryId, string? territoryNames = null)
    {
        TerritoryId = territoryId;
        TerritoryNames = territoryNames;
    }

    public void SetParentTeam(Guid parentTeamId) => ParentTeamId = parentTeamId;
    public void SetDescription(string? description) => Description = description;
    public void SetTeamEmail(string? email) => TeamEmail = email;
    public void SetCommunicationChannel(string? channel) => CommunicationChannel = channel;
    public void SetCurrency(string currency) => Currency = currency;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void UpdateDetails(string name, string code, string? description = null)
    {
        Name = name;
        Code = code;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public int GetActiveMemberCount() => _members.Count(m => m.IsActive);
}

/// <summary>
/// Satış takımı üyesi / Sales team member
/// </summary>
public class SalesTeamMember : TenantEntity
{
    public Guid SalesTeamId { get; private set; }
    public int UserId { get; private set; }
    public string? UserName { get; private set; }
    public SalesTeamRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime JoinedDate { get; private set; }
    public DateTime? LeftDate { get; private set; }

    /// <summary>
    /// Bireysel satış hedefi / Individual sales target
    /// </summary>
    public decimal? IndividualTarget { get; private set; }

    /// <summary>
    /// Komisyon oranı (%) / Commission rate
    /// </summary>
    public decimal? CommissionRate { get; private set; }

    public virtual SalesTeam SalesTeam { get; private set; } = null!;

    protected SalesTeamMember() : base() { }

    public SalesTeamMember(
        Guid salesTeamId,
        int userId,
        string? userName = null,
        SalesTeamRole role = SalesTeamRole.Member) : base(Guid.NewGuid(), Guid.Empty)
    {
        SalesTeamId = salesTeamId;
        UserId = userId;
        UserName = userName;
        Role = role;
        IsActive = true;
        JoinedDate = DateTime.UtcNow;
    }

    public void SetRole(SalesTeamRole role) => Role = role;
    public void SetIndividualTarget(decimal? target) => IndividualTarget = target;
    public void SetCommissionRate(decimal? rate) => CommissionRate = rate;
    public void SetUserName(string? name) => UserName = name;

    public void Deactivate()
    {
        IsActive = false;
        LeftDate = DateTime.UtcNow;
    }

    public void Reactivate()
    {
        IsActive = true;
        LeftDate = null;
    }
}

#region Enums

public enum SalesTeamRole
{
    /// <summary>Üye / Member</summary>
    Member = 1,

    /// <summary>Kıdemli / Senior</summary>
    Senior = 2,

    /// <summary>Lider / Leader</summary>
    Leader = 3,

    /// <summary>Yönetici / Manager</summary>
    Manager = 4,

    /// <summary>Direktör / Director</summary>
    Director = 5
}

#endregion
