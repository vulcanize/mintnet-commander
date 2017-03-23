.PHONY: default install clean

default: kube-aws

kube-aws:
	glide install
	$(MAKE) -C vendor/github.com/coreos/kube-aws
	cp -f vendor/github.com/coreos/kube-aws/bin/kube-aws .

install: kube-aws
	cp -f kube-aws $(GOPATH)/bin

clean:
	rm -rf kube-aws vendor
