package compost

func Plan(req CompostRequest) CompostPlan {

	if req.Goal == "Increase Potassium" {
		for _, s := range req.Sources {
			if s == "Banana Peels" {
				return CompostPlan{
					Mix:  "Banana Peels + Dry Leaves (1:1)",
					Note: "Maintain aeration for 6-8 weeks",
				}
			}
		}
	}

	return CompostPlan{
		Mix:  "General compost mix",
		Note: "Ensure balanced carbon-nitrogen ratio",
	}
}