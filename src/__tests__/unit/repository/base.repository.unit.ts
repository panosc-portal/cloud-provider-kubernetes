import {expect} from '@loopback/testlab';
import { Image } from '../../../models';

import {testDataSource} from '../../fixtures/datasources/testdb.datasource';
import { BaseRepository } from '../../../repositories/base.repository';
import { WhereBuilder } from '@loopback/repository';

describe('BaseRepository', () => {
  const baseRepository: BaseRepository<Image, number> = new BaseRepository(testDataSource, Image);

  it('converts = condition', async () => {
    const where = new WhereBuilder()
      .eq('id', 1)
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id = :p1');
    expect(paramterizedClause.parameters.p1).to.equal(1);
  });

  it('converts != condition', async () => {
    const where = new WhereBuilder()
      .neq('id', 1)
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id != :p1');
    expect(paramterizedClause.parameters.p1).to.equal(1);
  });

  it('converts < condition', async () => {
    const where = new WhereBuilder()
      .lt('id', 1)
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id < :p1');
    expect(paramterizedClause.parameters.p1).to.equal(1);
  });

  it('converts <= condition', async () => {
    const where = new WhereBuilder()
      .lte('id', 1)
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id <= :p1');
    expect(paramterizedClause.parameters.p1).to.equal(1);
  });

  it('converts > condition', async () => {
    const where = new WhereBuilder()
      .gt('id', 1)
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id > :p1');
    expect(paramterizedClause.parameters.p1).to.equal(1);
  });

  it('converts >= condition', async () => {
    const where = new WhereBuilder()
      .gte('id', 1)
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id >= :p1');
    expect(paramterizedClause.parameters.p1).to.equal(1);
  });

  it('converts BETWEEN condition', async () => {
    const where = new WhereBuilder()
      .between('id', 1, 2)
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id BETWEEN :p1 AND :p2');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal(2);
  });

  it('converts IN condition', async () => {
    const where = new WhereBuilder()
      .inq('id', [1, 2, 3, 4])
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id IN (:p1, :p2, :p3, :p4)');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal(2);
    expect(paramterizedClause.parameters.p3).to.equal(3);
    expect(paramterizedClause.parameters.p4).to.equal(4);
  });

  it('converts NOT IN condition', async () => {
    const where = new WhereBuilder()
      .nin('id', [1, 2, 3, 4])
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('id NOT IN (:p1, :p2, :p3, :p4)');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal(2);
    expect(paramterizedClause.parameters.p3).to.equal(3);
    expect(paramterizedClause.parameters.p4).to.equal(4);
  });


  it('converts single AND condition', async () => {
    const where = new WhereBuilder()
      .and({x: 1}, {y: 'test'})
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('x = :p1 AND y = :p2');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal('test');
  });

  it('converts single OR condition', async () => {
    const where = new WhereBuilder()
      .or({x: 1}, {y: 'test'})
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('(x = :p1 OR y = :p2)');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal('test');
  });

  it('converts combined AND condition', async () => {
    const where = new WhereBuilder()
      .eq('a', 10)
      .and({x: 1}, {y: 'test'})
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('x = :p1 AND y = :p2 AND a = :p3');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal('test');
    expect(paramterizedClause.parameters.p3).to.equal(10);
  });

  it('converts combined AND condition with embeded >', async () => {
    const where = new WhereBuilder()
      .eq('a', 10)
      .and({x: 1}, {y: {gt: 3}})
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('x = :p1 AND y > :p2 AND a = :p3');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal(3);
    expect(paramterizedClause.parameters.p3).to.equal(10);
  });

  it('converts combined AND and OR conditions with embeded >, < and =', async () => {
    const where = new WhereBuilder()
      .eq('a', 10)
      .and({x: 1}, {y: {gt: 3}})
      .or({x: {gt: 2}}, {and: [{a: 3}, {b: {lt: 2}}]})
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    expect(paramterizedClause.clause).to.equal('x = :p1 AND y > :p2 AND (x > :p3 OR (a = :p4 AND b < :p5)) AND a = :p6');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal(3);
    expect(paramterizedClause.parameters.p3).to.equal(2);
    expect(paramterizedClause.parameters.p4).to.equal(3);
    expect(paramterizedClause.parameters.p5).to.equal(2);
    expect(paramterizedClause.parameters.p6).to.equal(10);
  });

  it('converts mulitple AND and OR conditions with embeded >, < and =', async () => {
    const where = new WhereBuilder()
      .eq('a', 10)
      .and({x: 1}, {y: {gt: 3}})
      .and({x: 1}, {or: [{y: {gt: 3}}, {y: {lt: 2}}]})
      .or({x: {gt: 2}}, {and: [{a: 3}, {b: {lt: 4}}]})
      .or({x: {lt: 2}}, {x: {gt: 3}})
      .build();
    const paramterizedClause = baseRepository.buildWhere(where);

    // 'x = 1 AND y > 3 AND a = 10 AND x = 1 AND (Y > 3 OR Y < 2) AND (X > 2 OR (a = 3 AND b < 2)) AND (x < 2 OR x > 3)'
    expect(paramterizedClause.clause).to.equal('x = :p1 AND y > :p2 AND a = :p3 AND x = :p4 AND (y > :p5 OR y < :p6) AND (x > :p7 OR (a = :p8 AND b < :p9)) AND (x < :p10 OR x > :p11)');
    expect(paramterizedClause.parameters.p1).to.equal(1);
    expect(paramterizedClause.parameters.p2).to.equal(3);
    expect(paramterizedClause.parameters.p3).to.equal(10);
    expect(paramterizedClause.parameters.p4).to.equal(1);
    expect(paramterizedClause.parameters.p5).to.equal(3);
    expect(paramterizedClause.parameters.p6).to.equal(2);
    expect(paramterizedClause.parameters.p7).to.equal(2);
    expect(paramterizedClause.parameters.p8).to.equal(3);
    expect(paramterizedClause.parameters.p9).to.equal(4);
    expect(paramterizedClause.parameters.p10).to.equal(2);
    expect(paramterizedClause.parameters.p11).to.equal(3);
  });


});
