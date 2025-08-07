using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Factories;

public class MasterDbContextFactory : IDesignTimeDbContextFactory<MasterDbContext>
{
    public MasterDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MasterDbContext>();
        
        // Design-time connection string
        optionsBuilder.UseSqlServer(
            "Server=DESKTOP-A1C2AO3;Database=StockerMasterDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True");

        return new MasterDbContext(optionsBuilder.Options);
    }
}