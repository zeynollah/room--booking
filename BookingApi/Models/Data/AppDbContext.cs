using Microsoft.EntityFrameworkCore;
using BookingApi.Models;

namespace BookingApi.Data
{
    public class AppDbContext : DbContext
    {
        // Konstruktor som tar emot DbContextOptions och skickar dem vidare till basklassen
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        // DbSet-egenskaper som representerar tabellerna i databasen
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<Booking> Bookings => Set<Booking>();
        // Metod som konfigurerar entiteterna och deras relationer i databasen
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Kopplar entiteterna till deras respektive tabeller i databasen
            modelBuilder.Entity<Room>().ToTable("rooms");
            modelBuilder.Entity<Booking>().ToTable("bookings");
        }
    }
}