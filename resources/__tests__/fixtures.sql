insert into protocol (id, name, port) 
values (1, "RDP", 3389);
insert into protocol (id, name, port) 
values (2, "SSH", 22);
insert into protocol (id, name, port) 
values (3, "HTTPS", 443);
insert into protocol (id, name, port) 
values (4, "GUACD", 4822);

insert into image (id, name, path, description) 
values (1, "image 1", "repo1/image-name1", "An image");
insert into image (id, name, path, description) 
values (2, "image 2", "repo2/image-name2", "Another image");
insert into image (id, name, path, description) 
values (3, "image 3", "repo3/image-name3", "A image not associated to an instance");

insert into image_protocol (image_id, protocol_id)
values (1, 1);
insert into image_protocol (image_id, protocol_id)
values (1, 2);
insert into image_protocol (image_id, protocol_id)
values (2, 1);
insert into image_protocol (image_id, protocol_id)
values (2, 3);
insert into image_protocol (image_id, protocol_id)
values (3, 1);
insert into image_protocol (image_id, protocol_id)
values (3, 4);

insert into flavour(id, name, description, cpu, memory)
values (1, "flavour 1", "A flavour", 1.5, 2048);
insert into flavour(id, name, description, cpu, memory)
values (2, "flavour 2", "Another flavour", 8, 8192);
insert into flavour(id, name, description, cpu, memory)
values (3, "flavour 3", "A flavour not associated to an instance", 8, 8192);

insert into instance(id, name, description, image_id, flavour_id, hostname, status, current_cpu, current_memory, namespace, created_at, updated_at)
values (1, "instance1", "A test instance", 1, 1, "instance1.host.eu", "PENDING", 0, 0, 'panosc', '2019-01-01', '2019-01-01');
insert into instance(id, name, description, image_id, flavour_id, hostname, status, current_cpu, current_memory, namespace, created_at, updated_at)
values (2, "instance2", "Another test instance", 2, 2, "instance2.host.eu", "BUILDING", 0, 0, 'panosc', '2019-01-01', '2019-01-01');
insert into instance(id, name, description, image_id, flavour_id, hostname, status, current_cpu, current_memory, namespace, created_at, updated_at)
values (3, "instance3", "A third test instance", 2, 2, "instance3.host.eu", "BUILDING", 0, 0, 'panosc', '2019-01-01', '2019-01-01');
insert into instance(id, name, description, image_id, flavour_id, hostname, status, current_cpu, current_memory, namespace, created_at, updated_at, deleted)
values (4, "instance4", "A deleted instance", 2, 2, "instance3.host.eu", "DELETED", 0, 0, 'panosc', '2019-01-01', '2019-01-01', true);
insert into instance(id, name, description, image_id, flavour_id, hostname, status, current_cpu, current_memory, namespace, created_at, updated_at)
values (5, "instance5", "A fifth test instance", 2, 2, "instance3.host.eu", "ACTIVE", 0, 0, 'panosc', '2019-01-01', '2019-01-01');
