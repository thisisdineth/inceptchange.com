# syntax=docker/dockerfile:1
FROM golang:1.24-alpine AS build
WORKDIR /app
COPY go.mod ./
COPY *.go ./
RUN go test ./... && go vet ./...
RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/enquiry .

FROM alpine:3.22 AS runtime
RUN apk add --no-cache ca-certificates && addgroup -S app && adduser -S app -G app
COPY --from=build /out/enquiry /usr/local/bin/enquiry
USER app
ENV LISTEN_ADDR=0.0.0.0:8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
CMD ["/usr/local/bin/enquiry"]
