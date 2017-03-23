MACHINE_COUNT?=4
DATA_DIR?=./data

.PHONY: clean pregenerate

generate:
	@./scripts/generate.sh ${DATA_DIR} ${MACHINE_COUNT}

clean:
	rm -rvf ${DATA_DIR}/machine-*
