# Bokningssystem

En webbapp för att boka rum. Man väljer rum, skriver sitt namn och anger start och slut. Bokningen sparas i PostgreSQL. Om rummet redan är upptaget under den tiden avvisas bokningen.

Sidan är på svenska. API:t är byggt med ASP.NET Core.

## Funktioner

- Hämta rum från databasen och visa dem i formuläret
- Skapa en bokning med namn, start och slut
- Visa alla bokningar, sorterade efter starttid
- Ta bort en bokning
- Avvisa en tid som krockar med en befintlig bokning för samma rum

## Teknik

- C# och ASP.NET Core 10
- Entity Framework Core med Npgsql
- PostgreSQL
- HTML, CSS och JavaScript, utan ramverk

## Förutsättningar

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- PostgreSQL 14 eller nyare

## API

| Metod | Sökväg | Beskrivning |
| --- | --- | --- |
| `GET` | `/api/rooms` | Alla rum |
| `POST` | `/api/rooms` | Skapa ett rum |
| `GET` | `/api/bookings` | Alla bokningar |
| `POST` | `/api/bookings` | Skapa en bokning |
| `DELETE` | `/api/bookings/{id}` | Ta bort en bokning |

En ny bokning skickas som JSON. Tiden är lokal svensk tid, utan tidszon:

```json
{
  "roomId": 1,
  "customerName": "Anna Svensson",
  "startTime": "2026-11-02T10:00:00",
  "endTime": "2026-11-02T11:00:00"
}
```

| Status | När |
| --- | --- |
| `201` | Bokningen sparades |
| `400` | Sluttiden är inte efter starttiden, eller rummet finns inte |
| `409` | Rummet är redan bokat under den tiden |

Samma anrop finns i `BookingApi/BookingApi.http`.

## Dubbelbokning

API:t släpper inte igenom en ny bokning om samma rum redan har en tid som börjar före den nya slutar och slutar efter den nya börjar. En bokning som börjar exakt när den förra slutar är tillåten.

## Tider

Formuläret skickar en klocktid utan tidszon. API:t läser den som `Europe/Stockholm` och sparar UTC i kolumner av typen `timestamp with time zone`. Sidan visar tiden i webbläsarens svenska datumformat.

## Projektstruktur

```text
BookingApi.slnx
README.md
database/schema.sql
BookingApi/
  Program.cs
  Controllers/          API för rum och bokningar
  Models/               Booking och Room
  Models/Data/          EF Core-kontext
  wwwroot/              Sidan: index.html, style.css, script.js
  appsettings.Development.example.json
```
