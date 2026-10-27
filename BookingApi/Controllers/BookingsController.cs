using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Models;

namespace BookingApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookings()
        {
            var bookings = await _context.Bookings.ToListAsync();
            return Ok(bookings);
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<ActionResult<Booking>> PostBooking(Booking booking)
        {
            // Formuläret skickar en klocktid utan tidszon. Kolumnen är
            // "timestamp with time zone" och Npgsql accepterar bara UTC.
            booking.StartTime = ToUtcFromStockholm(booking.StartTime);
            booking.EndTime = ToUtcFromStockholm(booking.EndTime);

            if (booking.EndTime <= booking.StartTime)
            {
                return BadRequest("Sluttiden måste vara efter starttiden.");
            }

            var roomExists = await _context.Rooms.AnyAsync(r => r.Id == booking.RoomId);
            if (!roomExists)
            {
                return BadRequest($"Rummet med ID {booking.RoomId} existerar inte.");
            }

            var overlaps = await _context.Bookings.AnyAsync(existing =>
                existing.RoomId == booking.RoomId &&
                existing.StartTime < booking.EndTime &&
                existing.EndTime > booking.StartTime);

            if (overlaps)
            {
                return Conflict("Det finns redan en bokning för detta rum under den angivna tiden.");
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBookings), new { id = booking.Id }, booking);
        }

        // DELETE: api/bookings/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null)
            {
                return NotFound();
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Tolkar en tid utan tidszon som svensk lokal tid och gör om den till UTC.
        private static DateTime ToUtcFromStockholm(DateTime value)
        {
            if (value.Kind == DateTimeKind.Utc)
            {
                return value;
            }

            var wallClock = DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
            var stockholm = TimeZoneInfo.FindSystemTimeZoneById("Europe/Stockholm");
            return TimeZoneInfo.ConvertTimeToUtc(wallClock, stockholm);
        }
    }
}
