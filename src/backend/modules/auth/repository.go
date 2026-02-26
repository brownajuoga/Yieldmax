package auth

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Repository interface {
	CreateUser(email, password, name string) (*User, error)
	GetUserByEmail(email string) (*User, error)
	GetUserByID(id string) (*User, error)
}

type SQLiteRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &SQLiteRepository{db: db}
}

func (r *SQLiteRepository) CreateUser(email, password, name string) (*User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return nil, err
	}

	user := &User{
		ID:        uuid.New().String(),
		Email:     email,
		Password:  string(hashedPassword),
		Name:      name,
		CreatedAt: time.Now(),
	}

	_, err = r.db.Exec(
		"INSERT INTO users (id, email, password, name, created_at) VALUES (?, ?, ?, ?, ?)",
		user.ID, user.Email, user.Password, user.Name, user.CreatedAt,
	)

	return user, err
}

func (r *SQLiteRepository) GetUserByEmail(email string) (*User, error) {
	user := &User{}
	err := r.db.QueryRow(
		"SELECT id, email, password, name, created_at FROM users WHERE email = ?",
		email,
	).Scan(&user.ID, &user.Email, &user.Password, &user.Name, &user.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

func (r *SQLiteRepository) GetUserByID(id string) (*User, error) {
	user := &User{}
	err := r.db.QueryRow(
		"SELECT id, email, password, name, created_at FROM users WHERE id = ?",
		id,
	).Scan(&user.ID, &user.Email, &user.Password, &user.Name, &user.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}
