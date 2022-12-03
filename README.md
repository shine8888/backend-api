# Assessment Backend

## Getting started

### Setup the project

1. Clone the repository
2. Install the project node package from the project root
   ```sh
   npm install || yarn
   ```

## Tests my main APIs

1.  Register API: POST - `http://localhost:8080/users/register` with body contains: name, email, password
2.  Login API: POST - `http://localhost:8080/users/login` with body contains: email, password
3.  Get Access Token: POST - `http://localhost:8080/users/access-token` with body contains: refreshToken
4.  Deposit: POST - `http://localhost:8080/users/deposit` with body contain: userId, amount, Bearer Token in headers
5.  Withdrawl: POST - `http://localhost:8080/users/withdrawl` with body contain: userId, amount, Bearer Token in headers
6.  Portfolios: GET - `http://localhost:8080/users/:userId/portfolio` with params: userId, Bearer Token in headers

## Notes:
1.  I included the Document API file in JSON. You can import it to your PostMan and test it
