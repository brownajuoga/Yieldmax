package farm

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Repository interface {
	CreateFarm(name, farmType, location, ownerID string) (*Farm, error)
	GetFarmByOwnerID(ownerID string) (*Farm, error)
	GetFarmsByOwnerID(ownerID string) ([]Farm, error)
	UpdateFarm(id, name, farmType, location string) error
}

type SQLiteRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &SQLiteRepository{db: db}
}

func (r *SQLiteRepository) CreateFarm(name, farmType, location, ownerID string) (*Farm, error) {
	farm := &Farm{
		ID:        uuid.New().String(),
		Name:      name,
		Type:      farmType,
		Location:  location,
		OwnerID:   ownerID,
		CreatedAt: time.Now(),
	}

	_, err := r.db.Exec(
		"INSERT INTO farms (id, name, type, location, owner_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		farm.ID, farm.Name, farm.Type, farm.Location, farm.OwnerID, farm.CreatedAt,
	)

	return farm, err
}

func (r *SQLiteRepository) GetFarmByOwnerID(ownerID string) (*Farm, error) {
	farm := &Farm{}
	err := r.db.QueryRow(
		"SELECT id, name, type, location, owner_id, created_at FROM farms WHERE owner_id = ?",
		ownerID,
	).Scan(&farm.ID, &farm.Name, &farm.Type, &farm.Location, &farm.OwnerID, &farm.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	return farm, err
}

func (r *SQLiteRepository) GetFarmsByOwnerID(ownerID string) ([]Farm, error) {
	rows, err := r.db.Query(
		"SELECT id, name, type, location, owner_id, created_at FROM farms WHERE owner_id = ?",
		ownerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var farms []Farm
	for rows.Next() {
		var farm Farm
		err := rows.Scan(&farm.ID, &farm.Name, &farm.Type, &farm.Location, &farm.OwnerID, &farm.CreatedAt)
		if err != nil {
			return nil, err
		}
		farms = append(farms, farm)
	}
	return farms, nil
}
func (r *SQLiteRepository) UpdateFarm(id, name, farmType, location string) error {
	_, err := r.db.Exec(
		"UPDATE farms SET name = ?, type = ?, location = ? WHERE id = ?",
		name, farmType, location, id,
	)
	return err
}