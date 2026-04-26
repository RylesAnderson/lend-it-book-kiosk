# Lend IT Book Kiosk — Backend

Spring Boot 3 + Java 21 REST API.

## Run

```bash
# If you have Maven installed:
mvn spring-boot:run

# Or install Maven first (macOS):
brew install maven

# Windows: https://maven.apache.org/download.cgi
```

Or open `pom.xml` in IntelliJ IDEA and click Run on `BookKioskApplication`.

Server runs at `http://localhost:8080`.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a student account |
| POST | `/api/auth/login` | No | Get auth token |
| POST | `/api/auth/logout` | Yes | Invalidate token |
| GET | `/api/books` | No | List/search books (`?query=`, `?genre=`, `?availableOnly=true`) |
| GET | `/api/books/{id}` | No | Get one book |
| GET | `/api/loans/me` | Yes | My loans |
| POST | `/api/loans` | Yes | Borrow a book (`{"bookId": 1}`) |
| POST | `/api/loans/{loanId}/return` | Yes | Return a book |

## Test with curl

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Riley","email":"riley@test.com","password":"password123"}'

# Copy the returned token, then:
TOKEN="paste-token-here"

# List books
curl http://localhost:8080/api/books

# Borrow book 1
curl -X POST http://localhost:8080/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"bookId": 1}'
```

## H2 console

While running, visit `http://localhost:8080/h2-console`:

- JDBC URL: `jdbc:h2:mem:lenditbookkiosk`
- Username: `sa`
- Password: (blank)
