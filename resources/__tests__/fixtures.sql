insert into image (id, name, description) 
values (1, "image 1", "An image");
insert into image (id, name, description) 
values (2, "image 2", "Another image");
insert into image (id, name, description) 
values (3, "image 3", "A image not associated to an instance");

insert into flavour(id, name, description, cpu, memory)
values (1, "flavour 1", "A flavour", 1.5, 2048);
insert into flavour(id, name, description, cpu, memory)
values (2, "flavour 2", "Another flavour", 8, 8192);
insert into flavour(id, name, description, cpu, memory)
values (3, "flavour 3", "A flavour not associated to an instance", 8, 8192);

insert into instance(id, name, description, image_id, flavour_id, hostname, state, current_cpu, current_memory, created_at, updated_at)
values (1, "instance 1", "A test instance", 1, 1, "instance1.host.eu", "ACTIVE", 0, 0, '2019-01-01', '2019-01-01');

insert into instance(id, name, description, image_id, flavour_id, hostname, state, current_cpu, current_memory, created_at, updated_at)
values (2, "instance 2", "Another test instance", 2, 2, "instance2.host.eu", "BUILDING", 0, 0, '2019-01-01', '2019-01-01');
